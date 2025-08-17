import { DataType, PeerConnection, type Data } from "./peer";

// Optimized chunk size for Web Worker processing
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks - good for worker processing
const MAX_CONCURRENT_CHUNKS = 20; // Higher concurrency since workers handle processing
const BATCH_DELAY = 1; // Minimal delay

// Web Worker for file assembly
const createFileAssemblyWorker = (): Worker => {
  const workerCode = `
    let fileBuffers = new Map();
    
    self.onmessage = function(e) {
      const { type, data } = e.data;
      
      switch(type) {
        case 'INIT_FILE':
          const { fileId, totalChunks, fileName, fileType } = data;
          fileBuffers.set(fileId, {
            chunks: new Array(totalChunks).fill(null),
            receivedCount: 0,
            totalChunks,
            fileName,
            fileType,
            startTime: Date.now()
          });
          console.log('🔧 Worker: Initialized file buffer for', fileName);
          break;
          
        case 'ADD_CHUNK':
          const { fileId: chunkFileId, chunkIndex, chunk } = data;
          const fileBuffer = fileBuffers.get(chunkFileId);
          
          if (fileBuffer && fileBuffer.chunks[chunkIndex] === null) {
            fileBuffer.chunks[chunkIndex] = chunk;
            fileBuffer.receivedCount++;
            
            const progress = fileBuffer.receivedCount / fileBuffer.totalChunks;
            
            // Send progress update
            self.postMessage({
              type: 'PROGRESS',
              data: {
                fileId: chunkFileId,
                progress,
                receivedCount: fileBuffer.receivedCount,
                totalChunks: fileBuffer.totalChunks
              }
            });
            
            // Check if file is complete
            if (fileBuffer.receivedCount === fileBuffer.totalChunks) {
              console.log('🔄 Worker: Assembling file', fileBuffer.fileName);
              
              // Verify no missing chunks
              const missingChunks = [];
              for (let i = 0; i < fileBuffer.chunks.length; i++) {
                if (fileBuffer.chunks[i] === null) {
                  missingChunks.push(i);
                }
              }
              
              if (missingChunks.length > 0) {
                self.postMessage({
                  type: 'ERROR',
                  data: {
                    fileId: chunkFileId,
                    message: \`Missing \${missingChunks.length} chunks\`
                  }
                });
                return;
              }
              
              // Assemble file
              try {
                const blob = new Blob(fileBuffer.chunks, { 
                  type: fileBuffer.fileType 
                });
                
                const totalTime = (Date.now() - fileBuffer.startTime) / 1000;
                const speed = (blob.size / (1024 * 1024)) / totalTime;
                
                console.log(\`✅ Worker: File completed in \${totalTime.toFixed(2)}s (\${speed.toFixed(1)} MB/s)\`);
                
                self.postMessage({
                  type: 'FILE_COMPLETE',
                  data: {
                    fileId: chunkFileId,
                    blob: blob,
                    fileName: fileBuffer.fileName,
                    fileType: fileBuffer.fileType,
                    totalTime,
                    speed
                  }
                });
                
                // Clean up
                fileBuffers.delete(chunkFileId);
                
              } catch (error) {
                self.postMessage({
                  type: 'ERROR',
                  data: {
                    fileId: chunkFileId,
                    message: 'Failed to create blob: ' + error.message
                  }
                });
              }
            }
          }
          break;
          
        case 'CLEANUP':
          fileBuffers.clear();
          console.log('🧹 Worker: Cleaned up all file buffers');
          break;
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

// Global worker instance
let fileWorker: Worker | null = null;

const getFileWorker = (): Worker => {
  if (!fileWorker) {
    fileWorker = createFileAssemblyWorker();
  }
  return fileWorker;
};

// Enhanced sending with better flow control
export const sendFileInChunks = async (
  file: File,
  connectionId: string,
  fileId: string,
  onProgress: (progress: number) => void
) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let completedChunks = 0;

  console.log(
    `🚀 Sending ${file.name} (${(file.size / (1024 * 1024)).toFixed(
      2
    )}MB) in ${totalChunks} chunks`
  );

  const startTime = Date.now();

  const sendChunk = async (chunkIndex: number): Promise<void> => {
    try {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);
      const chunkBuffer = await chunk.arrayBuffer();

      await PeerConnection.sendConnection(connectionId, {
        dataType: DataType.CHUNK,
        chunk: chunkBuffer,
        chunkIndex,
        totalChunks,
        fileName: file.name,
        fileType: file.type,
        fileId,
      });

      completedChunks++;
      const progress = completedChunks / totalChunks;
      onProgress(progress);

      if (completedChunks % 10 === 0 || completedChunks === totalChunks) {
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (file.size * progress) / (1024 * 1024) / elapsed;
        console.log(
          `📤 Sent: ${completedChunks}/${totalChunks} (${(
            progress * 100
          ).toFixed(1)}% - ${speed.toFixed(1)} MB/s)`
        );
      }
    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex} failed:`, error);
      throw error;
    }
  };

  // Send in controlled batches
  try {
    for (let i = 0; i < totalChunks; i += MAX_CONCURRENT_CHUNKS) {
      const batchEnd = Math.min(i + MAX_CONCURRENT_CHUNKS, totalChunks);
      const batch: Promise<void>[] = [];

      for (let j = i; j < batchEnd; j++) {
        batch.push(sendChunk(j));
      }

      await Promise.all(batch);

      // Small delay between batches
      if (i + MAX_CONCURRENT_CHUNKS < totalChunks) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const avgSpeed = file.size / (1024 * 1024) / totalTime;
    console.log(
      `Transfer completed in ${totalTime.toFixed(2)}s (${avgSpeed.toFixed(
        1
      )} MB/s)`
    );
  } catch (error) {
    console.error("Transfer failed:", error);
    throw error;
  }
};

// Simpler Web Worker approach - no transferable objects to avoid DataCloneError
export function handleReceivedChunk(
  data: Data,
  onProgress: (progress: number) => void,
  onFileReady: (file: Blob, fileName: string, type: string) => void
) {
  if (
    data.dataType === DataType.CHUNK &&
    data.chunkIndex !== undefined &&
    data.totalChunks !== undefined &&
    data.fileId &&
    data.chunk &&
    data.fileName
  ) {
    const worker = getFileWorker();

    // Initialize file in worker on first chunk
    if (data.chunkIndex === 0) {
      console.log(`📥 Initializing reception: ${data.fileName}`);
      worker.postMessage({
        type: "INIT_FILE",
        data: {
          fileId: data.fileId,
          totalChunks: data.totalChunks,
          fileName: data.fileName,
          fileType: data.fileType || "application/octet-stream",
        },
      });

      // Set up worker message handler (only once per file)
      worker.onmessage = (e) => {
        const { type, data: workerData } = e.data;

        switch (type) {
          case "PROGRESS":
            const { progress, receivedCount, totalChunks } = workerData;

            if (receivedCount % 10 === 0 || receivedCount === totalChunks) {
              console.log(
                `📈 Progress: ${receivedCount}/${totalChunks} chunks (${(
                  progress * 100
                ).toFixed(1)}%)`
              );
            }

            onProgress(progress);
            break;

          case "FILE_COMPLETE":
            const { blob, fileName, fileType, totalTime, speed } = workerData;
            console.log(
              `🎉 File completed: ${fileName} in ${totalTime.toFixed(
                2
              )}s (${speed.toFixed(1)} MB/s)`
            );
            onFileReady(blob, fileName, fileType);
            break;

          case "ERROR":
            console.error(`❌ Worker error: ${workerData.message}`);
            break;
        }
      };
    }

    // Send chunk to worker - let it handle the data format
    worker.postMessage({
      type: "ADD_CHUNK",
      data: {
        fileId: data.fileId,
        chunkIndex: data.chunkIndex,
        chunk: data.chunk, // Send as-is, worker will handle it
      },
    });
  }
}

// Alternative non-worker approach if Web Workers cause issues
export function handleReceivedChunkNoWorker(
  data: Data,
  onProgress: (progress: number) => void,
  onFileReady: (file: Blob, fileName: string, type: string) => void
) {
  // Simple Map-based approach without workers
  if (
    data.dataType === DataType.CHUNK &&
    data.chunkIndex !== undefined &&
    data.totalChunks !== undefined &&
    data.fileId &&
    data.chunk &&
    data.fileName
  ) {
    const fileId = data.fileId;

    if (!receivedFilesMap.has(fileId)) {
      console.log(`📥 Starting reception: ${data.fileName}`);
      receivedFilesMap.set(fileId, {
        chunks: new Map(),
        expectedChunks: data.totalChunks,
        fileName: data.fileName,
        fileType: data.fileType || "application/octet-stream",
        startTime: Date.now(),
      });
    }

    const fileBuffer = receivedFilesMap.get(fileId)!;

    if (!fileBuffer.chunks.has(data.chunkIndex)) {
      fileBuffer.chunks.set(data.chunkIndex, data.chunk);

      const received = fileBuffer.chunks.size;
      const progress = received / fileBuffer.expectedChunks;

      if (received % 10 === 0 || received === fileBuffer.expectedChunks) {
        console.log(
          `📦 ${received}/${fileBuffer.expectedChunks} chunks (${(
            progress * 100
          ).toFixed(1)}%)`
        );
        onProgress(progress);
      }

      if (received === fileBuffer.expectedChunks) {
        // Use setTimeout to avoid blocking
        setTimeout(() => {
          console.log(`🔄 Assembling ${fileBuffer.fileName}...`);

          const orderedChunks: ArrayBuffer[] = [];
          for (let i = 0; i < fileBuffer.expectedChunks; i++) {
            const chunk = fileBuffer.chunks.get(i);
            if (chunk) {
              orderedChunks.push(chunk);
            } else {
              console.error(`❌ Missing chunk ${i}`);
              return;
            }
          }

          const blob = new Blob(orderedChunks, { type: fileBuffer.fileType });
          const totalTime = (Date.now() - fileBuffer.startTime) / 1000;
          const finalSpeed = blob.size / (1024 * 1024) / totalTime;

          console.log(
            `✅ File completed: ${(blob.size / (1024 * 1024)).toFixed(
              2
            )}MB in ${totalTime.toFixed(2)}s (${finalSpeed.toFixed(1)} MB/s)`
          );

          onFileReady(blob, fileBuffer.fileName, fileBuffer.fileType);
          receivedFilesMap.delete(fileId);
        }, 10);
      }
    }
  }
}

// Simple Map for non-worker approach
const receivedFilesMap = new Map<
  string,
  {
    chunks: Map<number, ArrayBuffer>;
    expectedChunks: number;
    fileName: string;
    fileType: string;
    startTime: number;
  }
>();

// Cleanup function
export const cleanupFileWorker = () => {
  if (fileWorker) {
    fileWorker.postMessage({ type: "CLEANUP" });
    fileWorker.terminate();
    fileWorker = null;
    console.log("🧹 File worker terminated");
  }
};

// Enhanced ultra-fast mode using Web Workers
export const sendFileUltraFastWithWorker = async (
  file: File,
  connectionId: string,
  fileId: string,
  onProgress: (progress: number) => void
) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let sentChunks = 0;

  console.log(
    `⚡ ULTRA-FAST with Workers: ${file.name} (${totalChunks} chunks)`
  );
  const startTime = Date.now();

  // Create chunks preparation worker
  const prepWorkerCode = `
    self.onmessage = function(e) {
      const { file, chunkSize, totalChunks, connectionId, fileId } = e.data;
      
      console.log('Worker: Preparing', totalChunks, 'chunks');
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        
        chunk.arrayBuffer().then(chunkBuffer => {
          self.postMessage({
            type: 'CHUNK_READY',
            data: {
              chunkIndex: i,
              chunkBuffer,
              totalChunks,
              fileName: file.name,
              fileType: file.type,
              fileId,
              connectionId
            }
          }, [chunkBuffer]);
        });
      }
    };
  `;

  const prepWorker = new Worker(
    URL.createObjectURL(
      new Blob([prepWorkerCode], { type: "application/javascript" })
    )
  );

  return new Promise<void>((resolve, reject) => {
    prepWorker.onmessage = (e) => {
      const { type, data } = e.data;

      if (type === "CHUNK_READY") {
        const {
          chunkIndex,
          chunkBuffer,
          totalChunks,
          fileName,
          fileType,
          fileId,
        } = data;

        // Send immediately without awaiting
        PeerConnection.sendConnection(connectionId, {
          dataType: DataType.CHUNK,
          chunk: chunkBuffer,
          chunkIndex,
          totalChunks,
          fileName,
          fileType,
          fileId,
        })
          .then(() => {
            sentChunks++;

            if (sentChunks % 10 === 0 || sentChunks === totalChunks) {
              const progress = sentChunks / totalChunks;
              onProgress(progress);

              const elapsed = (Date.now() - startTime) / 1000;
              const speed = (file.size * progress) / (1024 * 1024) / elapsed;
              console.log(
                `⚡ Ultra-fast: ${sentChunks}/${totalChunks} (${speed.toFixed(
                  1
                )} MB/s)`
              );
            }

            if (sentChunks === totalChunks) {
              prepWorker.terminate();
              const finalTime = (Date.now() - startTime) / 1000;
              const finalSpeed = file.size / (1024 * 1024) / finalTime;
              console.log(
                `🚀 Ultra-fast completed: ${finalTime.toFixed(
                  2
                )}s (${finalSpeed.toFixed(1)} MB/s)`
              );
              resolve();
            }
          })
          .catch(reject);
      }
    };

    prepWorker.onerror = reject;

    // Start preparation
    prepWorker.postMessage({
      file,
      chunkSize: CHUNK_SIZE,
      totalChunks,
      connectionId,
      fileId,
    });
  });
};

// Debug function
export const debugConnection = (connectionId: string) => {
  const connection = PeerConnection.getConnection(connectionId);
  console.log(`🔍 Connection ${connectionId}:`, {
    exists: !!connection,
    open: connection?.open,
    peer: connection?.peer,
    workerActive: !!fileWorker,
  });
};
