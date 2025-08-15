import { saveAs } from "file-saver";
import { Download } from "lucide-react";

import {
  clearAllDownloadedFiles,
  removeDownloadedFile,
} from "@/store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export function DownloadedFiles() {
  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const handleDownload = (fileId: string) => {
    const fileToDownload = fileState.downloadedFiles?.find(
      (f) => f.id === fileId
    );
    if (fileToDownload) {
      saveAs(fileToDownload.file, fileToDownload.fileName);
    }
  };

  const handleRemoveDownloadedFile = (fileId: string) => {
    dispatch(removeDownloadedFile(fileId));
  };

  const handleClearAllDownloaded = () => {
    dispatch(clearAllDownloadedFiles());
  };

  if (
    (!fileState.downloadedFiles || fileState.downloadedFiles.length === 0) &&
    !fileState.isReceiving
  ) {
    return null;
  }

  return (
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
        {fileState.isReceiving && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-green-600 flex-shrink-0">📥</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    📄 {fileState.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fileState.receiveProgress}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <progress
                  className="progress progress-success w-24"
                  value={fileState.receiveProgress}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        )}
        {fileState.downloadedFiles.map((downloadedFile) => (
          <div
            key={downloadedFile.id}
            className="bg-green-50 border border-green-200 p-3 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-green-600 flex-shrink-0">✅</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    📄 {downloadedFile.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(downloadedFile.size)} •{" "}
                    {new Date(downloadedFile.receivedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(downloadedFile.id)}
                  className="btn btn-xs btn-success"
                >
                  <Download className="size-3" />
                  Download
                </button>
                <button
                  onClick={() => handleRemoveDownloadedFile(downloadedFile.id)}
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
  );
}
