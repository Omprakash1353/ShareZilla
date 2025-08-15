import React from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  sendLoading: boolean;
  fileListLength: number;
  handleUpload: () => void;
  currentFileIndex: number;
  totalFiles: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onDrop,
  isUploading,
  sendLoading,
  fileListLength,
  handleUpload,
  currentFileIndex,
  totalFiles,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize: 1024 * 1024 * 1024,
    onDrop,
  });

  return (
    <>
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

      <button
        onClick={handleUpload}
        className="btn btn-success"
        disabled={!fileListLength || sendLoading || isUploading}
      >
        {isUploading
          ? `Sending... (${currentFileIndex}/${totalFiles})`
          : sendLoading
          ? "Preparing..."
          : `Send ${fileListLength > 0 ? fileListLength : ""} File${
              fileListLength !== 1 ? "s" : ""
            }`}
      </button>
    </>
  );
};

export default FileUploader;
