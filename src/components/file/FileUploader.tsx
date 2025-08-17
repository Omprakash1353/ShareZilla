import { FileUp, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendFileUltraFastWithWorker } from "@/helpers/file-transfer";
import { store } from "@/store";
import {
  addUploadingFile,
  updateFileUploadProgress,
} from "@/store/file/fileSlice";
import { useAppSelector } from "@/store/hooks";

export function FileUploader() {
  const dispatch = useDispatch();
  const fileState = useAppSelector((state) => state.file);
  const connection = useAppSelector((state) => state.connection);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      dispatch(
        addUploadingFile({
          fileName: file.name,
          size: file.size,
          type: file.type,
        })
      );

      const fileId = store.getState().file.uploadedFiles.at(-1)?.id;

      if (fileId && connection.selectedId) {
        sendFileUltraFastWithWorker(
          file,
          connection.selectedId,
          fileId,
          (progress) => {
            dispatch(
              updateFileUploadProgress({ fileId, progress: progress * 100 })
            );
          }
        );
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    maxSize: 1024 * 1024 * 1024,
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
