import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@/store";
import {
  clearAllUploadedFiles,
  removeUploadedFile,
} from "@/store/file/fileSlice";

export function UploadingFiles() {
  const dispatch = useDispatch();
  const { uploadedFiles } = useSelector((state: RootState) => ({
    uploadedFiles: state.file.uploadedFiles,
  }));

  const handleRemoveFile = (fileId: string) => {
    dispatch(removeUploadedFile(fileId));
  };

  const handleClearAll = () => {
    dispatch(clearAllUploadedFiles());
  };

  if (uploadedFiles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Uploading Files ({uploadedFiles.length})
        </h3>
        <button
          onClick={handleClearAll}
          className="btn btn-xs btn-ghost text-gray-500"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {uploadedFiles.map((file) => (
          <div
            key={file.id}
            className="bg-blue-50 border border-blue-200 p-3 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-blue-600 flex-shrink-0">📤</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    📄 {file.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {file.status === "completed"
                      ? "Completed"
                      : file.status === "error"
                      ? "Error"
                      : `${file.progress}%`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <progress
                  className={`progress ${
                    file.status === "completed"
                      ? "progress-success"
                      : file.status === "error"
                      ? "progress-error"
                      : "progress-info"
                  } w-24`}
                  value={file.progress}
                  max="100"
                ></progress>
                <button
                  onClick={() => handleRemoveFile(file.id)}
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
