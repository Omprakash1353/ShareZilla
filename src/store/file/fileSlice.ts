import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UploadedFile {
  id: string;
  fileName: string;
  type: string;
  size: number;
  uploadedAt: number;
  progress: number;
  status: "uploading" | "completed" | "error";
}

export interface DownloadedFile {
  id: string;
  file: Blob;
  fileName: string;
  receivedAt: number;
  size: number;
  type: string;
}

interface FileState {
  uploadProgress: number;
  receiveProgress: number;
  uploadedFiles: UploadedFile[];
  downloadedFiles: DownloadedFile[];
  fileName: string | null;
  isReceiving: boolean;
}

const initialState: FileState = {
  uploadProgress: 0,
  receiveProgress: 0,
  uploadedFiles: [],
  downloadedFiles: [],
  fileName: null,
  isReceiving: false,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    addUploadingFile: (
      state,
      action: PayloadAction<{ fileName: string; size: number; type: string }>
    ) => {
      const newFile: UploadedFile = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: action.payload.fileName,
        size: action.payload.size,
        type: action.payload.type,
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
    setReceivingFileName: (state, action: PayloadAction<string>) => {
      state.fileName = action.payload;
    },
    setReceiveProgress: (state, action: PayloadAction<number>) => {
      state.isReceiving = action.payload > 0 && action.payload < 100;
      state.receiveProgress = action.payload;
    },
    setDownloadedFile: (
      state,
      action: PayloadAction<{ file: Blob; fileName: string; type: string }>
    ) => {
      const newFile: DownloadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: action.payload.file,
        fileName: action.payload.fileName,
        receivedAt: Date.now(),
        type: action.payload.type,
        size: action.payload.file.size,
      };
      state.downloadedFiles.push(newFile);
      state.fileName = action.payload.fileName;
    },
    removeDownloadedFile: (state, action: PayloadAction<string>) => {
      state.downloadedFiles = state.downloadedFiles.filter(
        (file) => file.id !== action.payload
      );
    },
    clearAllDownloadedFiles: (state) => {
      state.downloadedFiles = [];
      state.fileName = null;
    },
    resetProgress: (state) => {
      state.uploadProgress = 0;
      state.receiveProgress = 0;
    },
  },
});

export const {
  addUploadingFile,
  updateFileUploadProgress,
  setFileUploadError,
  removeUploadedFile,
  clearAllUploadedFiles,
  setReceivingFileName,
  setReceiveProgress,
  setDownloadedFile,
  removeDownloadedFile,
  clearAllDownloadedFiles,
  resetProgress,
} = fileSlice.actions;

export default fileSlice.reducer;
