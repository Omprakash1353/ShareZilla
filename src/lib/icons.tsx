import type { FileItem } from "@/App";
import { AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react";

export const getStatusIcon = (status: FileItem["status"]) => {
  switch (status) {
    case "uploading":
      return <Upload className="h-4 w-4 text-muted-foreground" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};
