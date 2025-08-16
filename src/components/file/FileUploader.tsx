import { FileUp, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addUploadingFile } from "@/store/file/fileSlice";
import { useAppSelector } from "@/store/hooks";

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
}

export function FileUploader({ onDrop: parentOnDrop }: FileUploaderProps) {
  const dispatch = useDispatch();
  const fileState = useAppSelector((state) => state.file);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      dispatch(
        addUploadingFile({
          fileName: file.name,
          size: file.size,
          type: file.type,
        })
      );
    });
    parentOnDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize: 1024 * 1024 * 1024, // 1GB
    onDrop,
  });

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
          ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
          }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`p-4 rounded-full transition-colors ${
              isDragActive ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {isDragActive ? (
              <FileUp className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>

          <div>
            <h3 className="mb-2">
              {isDragActive ? "Drop files here" : "Drag and drop files here"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Or click to select files from your device
            </p>
            <Button variant="outline" type="button">
              Choose Files
            </Button>
          </div>
        </div>

        <input
          {...getInputProps()}
          disabled={fileState.uploadedFiles.some(
            (f) => f.status === "uploading"
          )}
        />
      </div>
    </Card>
  );
}
