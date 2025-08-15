import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { addUploadingFile } from "@/store/file/fileSlice";

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
}

export function FileUploader({
  onDrop: parentOnDrop,
  isUploading,
}: FileUploaderProps) {
  const dispatch = useDispatch();

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      dispatch(addUploadingFile({ fileName: file.name, size: file.size }));
    });
    parentOnDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize: 1024 * 1024 * 1024,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 p-4 rounded-md text-center cursor-pointer bg-base-200 hover:bg-base-300 transition"
    >
      <input {...getInputProps()} disabled={isUploading} />
      <p className="text-gray-400">
        {isDragActive
          ? "Drop files here..."
          : "Drag and drop files, or click to select"}
      </p>
    </div>
  );
}
