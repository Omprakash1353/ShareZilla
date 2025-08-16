import { useDispatch, useSelector } from "react-redux";

import { getStatusIcon } from "@/lib/icons";
import { formatFileSize, getFileTypeIcon } from "@/lib/utils";
import type { RootState } from "@/store";
import {
  clearAllUploadedFiles,
  removeUploadedFile,
} from "@/store/file/fileSlice";
import { Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

export function UploadingFiles() {
  const [showAll, setShowAll] = useState(false);

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

  const displayFiles = showAll ? uploadedFiles : uploadedFiles.slice(0, 3);
  const hasMore = uploadedFiles.length > 3;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Uploaded Files</h3>
            <Badge variant="secondary">{uploadedFiles.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>

        <div className="space-y-3 max-h-100 overflow-y-auto">
          {displayFiles.map((file) => (
            <div
              key={file.id}
              className="bg-blue-50 border border-blue-200 p-3 rounded-lg group hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                    <span className="text-lg">
                      {getFileTypeIcon(file.type)}
                    </span>
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-800 truncate">
                      {file.fileName}
                    </h4>
                    <span className="size-4">{getStatusIcon(file.status)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>
                      {new Date(file.uploadedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Progress Bar for sending files */}
                  {file.status === "uploading" && (
                    <div className="mb-2">
                      <Progress
                        value={file.progress}
                        className="h-2 bg-blue-100"
                      />
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
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
              {showAll ? `Show Less` : `Show ${uploadedFiles.length - 3} More`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
