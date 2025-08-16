import { DataType, PeerConnection, type Data } from "./peer";

const CHUNK_SIZE = 1024 * 1024;

export const sendFileInChunks = async (
  file: File,
  connectionId: string,
  fileId: string,
  onProgress: (progress: number) => void
) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    await PeerConnection.sendConnection(connectionId, {
      dataType: DataType.CHUNK,
      chunk: await chunk.arrayBuffer(),
      chunkIndex: i,
      totalChunks,
      fileName: file.name,
      fileType: file.type,
      fileId, // Use the provided fileId
    });

    const progress = ((i + 1) / totalChunks) * 100;
    onProgress(progress);
  }
};

const receivedChunks = new Map<string, ArrayBuffer[]>();

export const handleReceivedChunk = (
  data: Data,
  onProgress: (progress: number) => void,
  onFileReady: (file: Blob, fileName: string, type: string) => void
) => {
  const { chunk, chunkIndex, totalChunks, fileName, fileType, fileId } = data;

  if (
    !chunk ||
    chunkIndex === undefined ||
    !totalChunks ||
    !fileId ||
    !fileName ||
    !fileType
  ) {
    console.error("Invalid chunk data received");
    return;
  }

  if (!receivedChunks.has(fileId)) {
    receivedChunks.set(fileId, []);
  }

  const chunks = receivedChunks.get(fileId)!;
  chunks[chunkIndex] = chunk;

  const progress = (chunks.filter(Boolean).length / totalChunks) * 100;
  onProgress(progress);

  if (chunks.filter(Boolean).length === totalChunks) {
    const fileBlob = new Blob(chunks, { type: fileType });
    onFileReady(fileBlob, fileName, fileType);
    receivedChunks.delete(fileId);
  }
};
