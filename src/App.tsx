import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import {
  Copy,
  Download,
  Laptop,
  Lock,
  Smartphone,
  Upload,
  Wifi,
} from "lucide-react";
import { handleReceivedChunk, sendFileInChunks } from "./helpers/file-transfer";
import { DataType, PeerConnection } from "./helpers/peer";
import {
  changeConnectionInput,
  connectPeer,
  selectItem,
} from "./store/connection/connectionActions";
import {
  addUploadingFile,
  clearAllDownloadedFiles,
  removeDownloadedFile,
  resetProgress,
  setDownloadedFile,
  setFileUploadError,
  setReceiveProgress,
  setUploadProgress,
  updateFileUploadProgress,
} from "./store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerActions";

interface ProgressState {
  isUploading: boolean;
  isReceiving: boolean;
  uploadProgress: number;
  receiveProgress: number;
  currentFileName: string;
  totalFiles: number;
  currentFileIndex: number;
  currentUploadFileIds: string[];
}

interface UploadFileWithMeta extends File {
  id: string;
}

export default function FileShare() {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const [fileList, setFileList] = useState<UploadFileWithMeta[]>([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [progressState, setProgressState] = useState<ProgressState>({
    isUploading: false,
    isReceiving: false,
    uploadProgress: 0,
    receiveProgress: 0,
    currentFileName: "",
    totalFiles: 0,
    currentFileIndex: 0,
    currentUploadFileIds: [],
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize: 1024 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const filesWithMeta = acceptedFiles.map((file) => {
        return Object.assign(file, {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      });
      setFileList((prev) => [...prev, ...filesWithMeta]);
    },
  });

  useEffect(() => {
    if (connection.selectedId) {
      PeerConnection.onConnectionReceiveData(connection.selectedId, (data) => {
        if (data.dataType === DataType.CHUNK) {
          setProgressState((prev) => ({
            ...prev,
            isReceiving: true,
            currentFileName: data.fileName || "Unknown file",
          }));

          handleReceivedChunk(
            data,
            (progress) => {
              const progressPercent = Math.round(progress * 100);
              setProgressState((prev) => ({
                ...prev,
                receiveProgress: progressPercent,
              }));
              dispatch(setReceiveProgress(progress));
            },
            (file, fileName) => {
              dispatch(setDownloadedFile({ file, fileName }));
              setProgressState((prev) => ({
                ...prev,
                isReceiving: false,
                receiveProgress: 0,
                currentFileName: "",
              }));
              toast.success(`File received: ${fileName}`);
            }
          );
        }
      });
    }
  }, [connection.selectedId, dispatch]);

  const handleStartSession = () => dispatch(startPeer());

  const handleStopSession = async () => {
    await PeerConnection.closePeerSession();
    dispatch(stopPeerSession());
    dispatch(resetProgress());
    setFileList([]);
    setProgressState({
      isUploading: false,
      isReceiving: false,
      uploadProgress: 0,
      receiveProgress: 0,
      currentFileName: "",
      totalFiles: 0,
      currentFileIndex: 0,
      currentUploadFileIds: [],
    });
  };

  const handleConnectOtherPeer = () => {
    if (connection.id) {
      dispatch(connectPeer(connection.id));
    } else {
      toast.error("Please enter a valid code");
    }
  };

  // const removeFile = (fileToRemove: File) => {
  //   setFileList((prev) => prev.filter((f) => f !== fileToRemove));
  // };

  const handleUpload = async () => {
    if (fileList.length === 0) return toast.warning("Please select files");
    if (!connection.selectedId)
      return toast.warning("Please select a connected user");

    setSendLoading(true);

    // Add all files to upload tracking
    const uploadFileIds: string[] = [];
    for (const file of fileList) {
      dispatch(addUploadingFile({ fileName: file.name, size: file.size }));
      uploadFileIds.push(file.id); // use already-set ID
    }

    setProgressState((prev) => ({
      ...prev,
      isUploading: true,
      totalFiles: fileList.length,
      currentFileIndex: 0,
      currentUploadFileIds: uploadFileIds,
    }));

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileId = uploadFileIds[i];

        setProgressState((prev) => ({
          ...prev,
          currentFileName: file.name,
          currentFileIndex: i + 1,
          uploadProgress: 0,
        }));

        await sendFileInChunks(file, connection.selectedId, (progress) => {
          const progressPercent = Math.round(progress * 100);

          // Update individual file progress
          dispatch(
            updateFileUploadProgress({ fileId, progress: progressPercent })
          );

          // Update overall progress for UI
          setProgressState((prev) => ({
            ...prev,
            uploadProgress: progressPercent,
          }));
          dispatch(setUploadProgress(progress));
        });

        // Mark file as completed
        dispatch(updateFileUploadProgress({ fileId, progress: 100 }));

        // Brief pause between files
        await new Promise((resolve) => setTimeout(resolve, 2));
      }

      toast.success("All files sent successfully");
      setFileList([]);
      setProgressState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        currentFileName: "",
        totalFiles: 0,
        currentFileIndex: 0,
        currentUploadFileIds: [],
      }));
    } catch (err) {
      console.error(err);
      toast.error("Error sending files");

      // Mark failed files as error
      uploadFileIds.forEach((fileId) => {
        dispatch(setFileUploadError(fileId));
      });

      setProgressState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        currentFileName: "",
        totalFiles: 0,
        currentFileIndex: 0,
        currentUploadFileIds: [],
      }));
    } finally {
      setSendLoading(false);
      dispatch(resetProgress());
    }
  };

  const handleDownload = (fileId?: string) => {
    if (fileId) {
      // Download specific file from the list
      const fileToDownload = fileState.downloadedFiles?.find(
        (f) => f.id === fileId
      );
      if (fileToDownload) {
        saveAs(fileToDownload.file, fileToDownload.fileName);
        // Don't automatically remove - let user decide
      }
    } else {
      // Legacy behavior - download the most recent file
      if (fileState.downloadedFile && fileState.fileName) {
        saveAs(fileState.downloadedFile, fileState.fileName);
        // Don't automatically remove - let user decide
      }
    }
  };

  const handleRemoveDownloadedFile = (fileId: string) => {
    dispatch(removeDownloadedFile(fileId));
  };

  const handleClearAllDownloaded = () => {
    dispatch(clearAllDownloadedFiles());
  };

  // const handleRemoveUploadedFile = (fileId: string) => {
  //   dispatch(removeUploadedFile(fileId));
  // };

  // const handleClearAllUploaded = () => {
  //   dispatch(clearAllUploadedFiles());
  // };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-1 gap-4 items-center justify-center px-4">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-2">
          <div className="text-primary-foreground flex size-7 items-center justify-center rounded-md">
            {/* Logo */}
          </div>
          <span className="font-semibold text-lg">ShareZilla</span>
        </header>

        <main className="flex flex-col gap-8">
          {!peer.started ? (
            <section className="flex flex-col items-center gap-6">
              {/* Device UI */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-xl opacity-20 scale-110 rounded-3xl" />
                <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-0 rounded-3xl shadow-2xl">
                  <div className="bg-gray-900 w-80 h-48 rounded-2xl flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <Wifi className="size-5" />
                        </div>
                        <div className="text-gray-400">|</div>
                        <div className="flex items-center gap-2 text-blue-400">
                          <Lock className="size-4" />
                          <span className="text-sm">Secured</span>
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm mb-2">
                        Ready to transfer
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <Smartphone className="size-6 text-blue-400" />
                        <div className="flex gap-1">
                          {[0, 0.2, 0.4].map((d, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: `${d}s` }}
                            />
                          ))}
                        </div>
                        <Laptop className="size-6 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 badge badge-accent px-3 py-1 shadow-lg">
                  Online
                </div>
                <div className="absolute -bottom-3 -left-3 badge badge-warning px-3 py-1 shadow-lg">
                  P2P Ready
                </div>
              </div>

              {/* Start/Receive Buttons */}
              <div className="flex gap-6">
                <button
                  className="btn btn-info w-28"
                  onClick={handleStartSession}
                  disabled={connection.loading}
                >
                  <Upload className="size-5 mr-2" />
                  Send
                </button>
                <button
                  className="btn btn-error w-28"
                  onClick={handleStartSession}
                  disabled={connection.loading}
                >
                  <Download className="size-5 mr-2" />
                  Receive
                </button>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="badge badge-outline">ID: {peer.id}</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(peer.id || "");
                    toast.info("Copied: " + peer.id);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Copy className="size-4" /> Copy
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={handleStopSession}
                >
                  Stop
                </button>
              </div>

              {/* Connect input */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input input-bordered w-full"
                  onChange={(e) =>
                    dispatch(changeConnectionInput(e.target.value))
                  }
                />
                <button
                  className="btn btn-info"
                  onClick={handleConnectOtherPeer}
                  disabled={connection.loading}
                >
                  Connect
                </button>
              </div>

              {/* Connection list */}
              {connection.list.length > 0 ? (
                <ul className="list bg-base-100 rounded-box shadow-md w-full">
                  {connection.list.map((e, index) => (
                    <li
                      key={index}
                      className={`list-row ${
                        connection.selectedId === e && "bg-zinc-200"
                      }`}
                      onClick={() => {
                        dispatch(selectItem(e));
                      }}
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">
                  Waiting for connection...
                </p>
              )}

              {/* Upload Progress Display */}
              {progressState.isUploading && (
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      📤 Uploading
                    </span>
                    <span className="text-sm text-gray-500">
                      {progressState.currentFileIndex} of{" "}
                      {progressState.totalFiles} files
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2 truncate">
                    {progressState.currentFileName}
                  </div>
                  <div className="flex items-center gap-2">
                    <progress
                      className="progress progress-info flex-1"
                      value={progressState.uploadProgress}
                      max="100"
                    ></progress>
                    <span className="text-sm font-medium min-w-[45px]">
                      {progressState.uploadProgress}%
                    </span>
                  </div>
                </div>
              )}

              {/* Receive Progress Display */}
              {progressState.isReceiving && (
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">
                      📥 Receiving
                    </span>
                    <span className="text-sm text-gray-500">Incoming file</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2 truncate">
                    {progressState.currentFileName}
                  </div>
                  <div className="flex items-center gap-2">
                    <progress
                      className="progress progress-success flex-1"
                      value={progressState.receiveProgress}
                      max="100"
                    ></progress>
                    <span className="text-sm font-medium min-w-[45px]">
                      {progressState.receiveProgress}%
                    </span>
                  </div>
                </div>
              )}

              {/* Dropzone for files */}
              <div
                {...getRootProps()}
                className="border-dashed border-2 p-4 rounded-md text-center cursor-pointer bg-base-200 hover:bg-base-300 transition"
              >
                <input {...getInputProps()} />
                <p className="text-gray-400">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag and drop files, or click to select"}
                </p>
              </div>

              {/* {fileList.map((file, index) => {
                const uploadedMeta = fileState.uploadedFiles.find(
                  (f) => f.id === file.id
                );
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-md"
                  >
                    <div className="truncate max-w-[70%]">
                      <div className="font-medium text-sm">📄 {file.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                      {uploadedMeta?.status === "uploading" && (
                        <div className="flex items-center gap-2 mt-1">
                          <progress
                            className="progress progress-warning flex-1 h-2"
                            value={uploadedMeta.progress}
                            max="100"
                          ></progress>
                          <span className="text-xs font-medium min-w-[35px]">
                            {uploadedMeta.progress}%
                          </span>
                        </div>
                      )}
                      {uploadedMeta?.status === "completed" && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          ✓ Upload completed
                        </div>
                      )}
                      {uploadedMeta?.status === "error" && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          ✗ Upload failed
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(file)}
                      className="btn btn-sm btn-error btn-outline"
                      disabled={progressState.isUploading}
                    >
                      Remove
                    </button>
                  </div>
                );
              })} */}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                className="btn btn-success"
                disabled={
                  !fileList.length || sendLoading || progressState.isUploading
                }
              >
                {progressState.isUploading
                  ? `Sending... (${progressState.currentFileIndex}/${progressState.totalFiles})`
                  : sendLoading
                  ? "Preparing..."
                  : `Send ${fileList.length > 0 ? fileList.length : ""} File${
                      fileList.length !== 1 ? "s" : ""
                    }`}
              </button>

              {/* Legacy progress bar (kept for compatibility) */}
              {fileState.progress > 0 &&
                !progressState.isUploading &&
                !progressState.isReceiving && (
                  <progress
                    className="progress progress-success w-full"
                    value={fileState.progress}
                    max="1"
                  ></progress>
                )}

              {/* Uploaded files display */}
              {/* {fileState.uploadedFiles &&
                fileState.uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Uploaded Files ({fileState.uploadedFiles.length})
                      </h3>
                      <button
                        onClick={handleClearAllUploaded}
                        className="btn btn-xs btn-ghost text-gray-500"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {fileState.uploadedFiles.map((uploadedFile) => (
                        <div
                          key={uploadedFile.id}
                          className={`border p-3 rounded-lg ${
                            uploadedFile.status === "completed"
                              ? "bg-blue-50 border-blue-200"
                              : uploadedFile.status === "error"
                              ? "bg-red-50 border-red-200"
                              : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="flex-shrink-0">
                                {uploadedFile.status === "completed" && "📤✅"}
                                {uploadedFile.status === "uploading" && "📤⏳"}
                                {uploadedFile.status === "error" && "📤❌"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm text-gray-800 truncate">
                                  📄 {uploadedFile.fileName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(uploadedFile.size)} •
                                  {new Date(
                                    uploadedFile.uploadedAt
                                  ).toLocaleTimeString()}
                                </div>
                                {uploadedFile.status === "uploading" && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <progress
                                      className="progress progress-warning flex-1 h-2"
                                      value={uploadedFile.progress}
                                      max="100"
                                    ></progress>
                                    <span className="text-xs font-medium min-w-[35px]">
                                      {uploadedFile.progress}%
                                    </span>
                                  </div>
                                )}
                                {uploadedFile.status === "completed" && (
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    ✓ Upload completed
                                  </div>
                                )}
                                {uploadedFile.status === "error" && (
                                  <div className="text-xs text-red-600 font-medium mt-1">
                                    ✗ Upload failed
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() =>
                                  handleRemoveUploadedFile(uploadedFile.id)
                                }
                                className="btn btn-xs btn-ghost text-gray-500"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

              {/* Downloaded files display */}
              {fileState.downloadedFiles &&
                fileState.downloadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Downloaded Files ({fileState.downloadedFiles.length})
                      </h3>
                      <button
                        onClick={handleClearAllDownloaded}
                        className="btn btn-xs btn-ghost text-gray-500"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {fileState.downloadedFiles.map((downloadedFile) => (
                        <div
                          key={downloadedFile.id}
                          className="bg-green-50 border border-green-200 p-3 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-green-600 flex-shrink-0">
                                ✅
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm text-gray-800 truncate">
                                  📄 {downloadedFile.fileName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(downloadedFile.size)} •
                                  {new Date(
                                    downloadedFile.receivedAt
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() =>
                                  handleDownload(downloadedFile.id)
                                }
                                className="btn btn-xs btn-success"
                              >
                                <Download className="size-3" />
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveDownloadedFile(downloadedFile.id)
                                }
                                className="btn btn-xs btn-ghost text-gray-500"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
