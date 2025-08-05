import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UploadedFile {
  id: string;
  fileName: string;
  size: number;
  uploadedAt: number;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface DownloadedFile {
  id: string;
  file: Blob;
  fileName: string;
  receivedAt: number;
  size: number;
}

interface FileState {
  uploadProgress: number;
  receiveProgress: number;
  uploadedFiles: UploadedFile[];
  downloadedFiles: DownloadedFile[];
  // Keep legacy fields for backward compatibility
  downloadedFile: Blob | null;
  fileName: string | null;
  progress: number;
}

const initialState: FileState = {
  uploadProgress: 0,
  receiveProgress: 0,
  uploadedFiles: [],
  downloadedFiles: [],
  downloadedFile: null,
  fileName: null,
  progress: 0,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
      // Keep legacy progress updated for backward compatibility
      state.progress = action.payload;
    },
    addUploadingFile: (
      state,
      action: PayloadAction<{ fileName: string; size: number }>
    ) => {
      const newFile: UploadedFile = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: action.payload.fileName,
        size: action.payload.size,
        uploadedAt: Date.now(),
        progress: 0,
        status: "uploading",
      };
      state.uploadedFiles.push(newFile);
    },
    updateFileUploadProgress: (
      state,
      action: PayloadAction<{ fileId: string; progress: number }>
    ) => {
      const file = state.uploadedFiles.find(
        (f) => f.id === action.payload.fileId
      );
      if (file) {
        file.progress = action.payload.progress;
        if (action.payload.progress >= 100) {
          file.status = "completed";
        }
      }
    },
    setFileUploadError: (state, action: PayloadAction<string>) => {
      const file = state.uploadedFiles.find((f) => f.id === action.payload);
      if (file) {
        file.status = "error";
      }
    },
    removeUploadedFile: (state, action: PayloadAction<string>) => {
      state.uploadedFiles = state.uploadedFiles.filter(
        (file) => file.id !== action.payload
      );
    },
    clearAllUploadedFiles: (state) => {
      state.uploadedFiles = [];
    },
    setReceiveProgress: (state, action: PayloadAction<number>) => {
      state.receiveProgress = action.payload;
    },
    setDownloadedFile: (
      state,
      action: PayloadAction<{ file: Blob; fileName: string }>
    ) => {
      const newFile: DownloadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: action.payload.file,
        fileName: action.payload.fileName,
        receivedAt: Date.now(),
        size: action.payload.file.size,
      };

      // Add to the list of downloaded files
      state.downloadedFiles.push(newFile);

      // Keep legacy fields updated with the latest file for backward compatibility
      state.downloadedFile = action.payload.file;
      state.fileName = action.payload.fileName;

      // Don't automatically remove the file - let user decide
      // state.receiveProgress = 0;
    },
    clearDownloadedFile: (state) => {
      // Legacy action - clear the legacy fields only
      state.downloadedFile = null;
      state.fileName = null;
    },
    removeDownloadedFile: (state, action: PayloadAction<string>) => {
      state.downloadedFiles = state.downloadedFiles.filter(
        (file) => file.id !== action.payload
      );

      // If the removed file was the legacy file, clear legacy fields
      const removedFile = state.downloadedFiles.find(
        (f) => f.id === action.payload
      );
      if (removedFile && state.fileName === removedFile.fileName) {
        state.downloadedFile = null;
        state.fileName = null;
      }
    },
    clearAllDownloadedFiles: (state) => {
      state.downloadedFiles = [];
      state.downloadedFile = null;
      state.fileName = null;
    },
    resetProgress: (state) => {
      state.uploadProgress = 0;
      state.receiveProgress = 0;
      state.progress = 0;
    },
  },
});

export const {
  setUploadProgress,
  addUploadingFile,
  updateFileUploadProgress,
  setFileUploadError,
  removeUploadedFile,
  clearAllUploadedFiles,
  setReceiveProgress,
  setDownloadedFile,
  clearDownloadedFile,
  removeDownloadedFile,
  clearAllDownloadedFiles,
  resetProgress,
} = fileSlice.actions;

export default fileSlice.reducer;
