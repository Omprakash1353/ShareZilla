import React from "react";

export interface ProgressState {
  isUploading: boolean;
  isReceiving: boolean;
  uploadProgress: number;
  receiveProgress: number;
  currentFileName: string;
  totalFiles: number;
  currentFileIndex: number;
  currentUploadFileIds: string[];
}

interface ProgressViewProps {
  progressState: Omit<ProgressState, "currentUploadFileIds">;
}

const ProgressView: React.FC<ProgressViewProps> = ({ progressState }) => {
  return (
    <>
      {progressState.isUploading && (
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">
              📤 Uploading
            </span>
            <span className="text-sm text-gray-500">
              {progressState.currentFileIndex} of {progressState.totalFiles}{" "}
              files
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
    </>
  );
};

export default ProgressView;
