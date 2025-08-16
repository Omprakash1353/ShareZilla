import { saveAs } from "file-saver";
import {
  CheckCircle2,
  Download,
  Eye,
  FolderDown,
  Trash2,
  X,
} from "lucide-react";

import { formatFileSize, getFileTypeIcon } from "@/lib/utils";
import {
  clearAllDownloadedFiles,
  removeDownloadedFile,
  type DownloadedFile,
} from "@/store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function DownloadedFiles() {
  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const [showAll, setShowAll] = useState(false);

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

  const previewFile = (file: DownloadedFile) => {
    if (!file.file) return;

    // For images, create a preview
    if (file.type.startsWith("image/")) {
      const blob = new Blob([file.file], { type: file.type });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${file.fileName}</title></head>
            <body style="margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
              <img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
      toast.success("Preview opened in new window");
    } else {
      toast.info("Preview not available for this file type");
    }
  };

  if (
    (!fileState.downloadedFiles || fileState.downloadedFiles.length === 0) &&
    !fileState.isReceiving
  ) {
    return null;
  }

  if (fileState.downloadedFiles.length === 0) {
    return null;
  }

  const displayFiles = showAll
    ? fileState.downloadedFiles
    : fileState.downloadedFiles.slice(0, 3);

  const hasMore = fileState.downloadedFiles.length > 3;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderDown className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Received Files</h3>
            <Badge variant="secondary">
              {fileState.downloadedFiles.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllDownloaded}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {displayFiles.map((file) => (
            <div
              key={file.id}
              className="bg-green-50 border border-green-200 p-3 rounded-lg group hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                    <span className="text-lg">
                      {getFileTypeIcon(file.file.type)}
                    </span>
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-800 truncate">
                      {file.fileName}
                    </h4>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>
                      Received at{" "}
                      {new Date(file.receivedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Preview Button (for images) */}
                  {file?.file.type.startsWith("image/") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => previewFile(file!)}
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Download Button */}
                  <Button
                    size="sm"
                    onClick={() => handleDownload(file.id)}
                    className="bg-emerald-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDownloadedFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-muted-foreground"
            >
              {showAll
                ? `Show Less`
                : `Show ${fileState.downloadedFiles.length - 3} More`}
            </Button>
          </div>
        )}

        {/* Download All Button */}
        {fileState.downloadedFiles.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fileState.downloadedFiles.forEach((file) => {
                  handleDownload(file.id);
                });
                toast.success(
                  `Downloaded ${fileState.downloadedFiles.length} files`
                );
              }}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All ({fileState.downloadedFiles.length})
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
