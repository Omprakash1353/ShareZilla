import { useEffect, useState } from "react";
import { toast } from "sonner";
import FileScannerModal from "./components/common/FileScannerModal";
import ScannerModal from "./components/common/ScannerModal";
import DownloadedFiles from "./components/file/DownloadedFiles";
import FileUploader from "./components/file/FileUploader";
import ProgressView, {
  type ProgressState,
} from "./components/file/ProgressView";
import Header from "./components/layout/Header";
import QRCodeModal from "./components/QRCodeModal";
import ConnectionManager from "./components/session/ConnectionManager";
import SessionView from "./components/session/SessionView";
import { handleReceivedChunk, sendFileInChunks } from "./helpers/file-transfer";
import { DataType, PeerConnection } from "./helpers/peer";
import {
  changeConnectionInput,
  connectPeer,
} from "./store/connection/connectionSlice";
import {
  addUploadingFile,
  resetProgress,
  setDownloadedFile,
  setFileUploadError,
  setReceiveProgress,
  setUploadProgress,
  updateFileUploadProgress,
} from "./store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerSlice";

interface UploadFileWithMeta extends File {
  id: string;
}

export default function FileShare() {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const [fileList, setFileList] = useState<UploadFileWithMeta[]>([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [progressState, setProgressState] = useState<ProgressState>({
    isUploading: false,
    isReceiving: false,
    uploadProgress: 0,
    receiveProgress: 0,
    currentFileName: "",
    totalFiles: 0,
    currentFileIndex: 0,
    currentUploadFileIds: [],
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showFileScanner, setShowFileScanner] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const filesWithMeta = acceptedFiles.map((file) => {
      return Object.assign(file, {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    });
    setFileList((prev) => [...prev, ...filesWithMeta]);
  };

  useEffect(() => {
    if (connection.selectedId) {
      PeerConnection.onConnectionReceiveData(connection.selectedId, (data) => {
        if (data.dataType === DataType.CHUNK) {
          setProgressState((prev) => ({
            ...prev,
            isReceiving: true,
            currentFileName: data.fileName || "Unknown file",
          }));

          handleReceivedChunk(
            data,
            (progress) => {
              const progressPercent = Math.round(progress * 100);
              setProgressState((prev) => ({
                ...prev,
                receiveProgress: progressPercent,
              }));
              dispatch(setReceiveProgress(progress));
            },
            (file, fileName) => {
              dispatch(setDownloadedFile({ file, fileName }));
              setProgressState((prev) => ({
                ...prev,
                isReceiving: false,
                receiveProgress: 0,
                currentFileName: "",
              }));
              toast.success(`File received: ${fileName}`);
            }
          );
        }
      });
    }
  }, [connection.selectedId, dispatch]);

  const handleStartSession = () => dispatch(startPeer());

  const handleStopSession = async () => {
    await PeerConnection.closePeerSession();
    dispatch(stopPeerSession());
    dispatch(resetProgress());
    setFileList([]);
    setProgressState({
      isUploading: false,
      isReceiving: false,
      uploadProgress: 0,
      receiveProgress: 0,
      currentFileName: "",
      totalFiles: 0,
      currentFileIndex: 0,
      currentUploadFileIds: [],
    });
  };

  const handleUpload = async () => {
    if (fileList.length === 0) return toast.warning("Please select files");
    if (!connection.selectedId)
      return toast.warning("Please select a connected user");

    setSendLoading(true);

    const uploadFileIds: string[] = [];
    for (const file of fileList) {
      dispatch(addUploadingFile({ fileName: file.name, size: file.size }));
      uploadFileIds.push(file.id);
    }

    setProgressState((prev) => ({
      ...prev,
      isUploading: true,
      totalFiles: fileList.length,
      currentFileIndex: 0,
      currentUploadFileIds: uploadFileIds,
    }));

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileId = uploadFileIds[i];

        setProgressState((prev) => ({
          ...prev,
          currentFileName: file.name,
          currentFileIndex: i + 1,
          uploadProgress: 0,
        }));

        await sendFileInChunks(file, connection.selectedId, (progress) => {
          const progressPercent = Math.round(progress * 100);
          dispatch(
            updateFileUploadProgress({ fileId, progress: progressPercent })
          );
          setProgressState((prev) => ({
            ...prev,
            uploadProgress: progressPercent,
          }));
          dispatch(setUploadProgress(progress));
        });

        dispatch(updateFileUploadProgress({ fileId, progress: 100 }));
        await new Promise((resolve) => setTimeout(resolve, 2));
      }

      toast.success("All files sent successfully");
      setFileList([]);
      setProgressState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        currentFileName: "",
        totalFiles: 0,
        currentFileIndex: 0,
        currentUploadFileIds: [],
      }));
    } catch (err) {
      console.error(err);
      toast.error("Error sending files");
      uploadFileIds.forEach((fileId) => {
        dispatch(setFileUploadError(fileId));
      });
      setProgressState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        currentFileName: "",
        totalFiles: 0,
        currentFileIndex: 0,
        currentUploadFileIds: [],
      }));
    } finally {
      setSendLoading(false);
      dispatch(resetProgress());
    }
  };

  const onScanSuccess = (decodedText: string) => {
    dispatch(changeConnectionInput(decodedText));
    dispatch(connectPeer(decodedText));
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-1 gap-4 items-center justify-center px-4">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <Header />

        <main className="flex flex-col gap-8">
          {!peer.started ? (
            <SessionView
              handleStartSession={handleStartSession}
              loading={connection.loading}
            />
          ) : (
            <section className="flex flex-col gap-6">
              <ConnectionManager
                setShowQRModal={setShowQRModal}
                setShowScanner={setShowScanner}
                setShowFileScanner={setShowFileScanner}
                handleStopSession={handleStopSession}
              />

              <ProgressView progressState={progressState} />

              <FileUploader
                onDrop={onDrop}
                isUploading={progressState.isUploading}
                sendLoading={sendLoading}
                fileListLength={fileList.length}
                handleUpload={handleUpload}
                currentFileIndex={progressState.currentFileIndex}
                totalFiles={progressState.totalFiles}
              />

              {fileState.progress > 0 &&
                !progressState.isUploading &&
                !progressState.isReceiving && (
                  <progress
                    className="progress progress-success w-full"
                    value={fileState.progress}
                    max="1"
                  ></progress>
                )}

              <DownloadedFiles />
            </section>
          )}
        </main>
        {showQRModal && peer.id && (
          <QRCodeModal
            id={peer.id}
            onClose={() => setShowQRModal(false)}
            setShowFileScanner={setShowFileScanner}
          />
        )}
        <ScannerModal
          show={showScanner}
          onClose={() => setShowScanner(false)}
          onScanSuccess={onScanSuccess}
        />
        <FileScannerModal
          show={showFileScanner}
          onClose={() => setShowFileScanner(false)}
          onScanSuccess={onScanSuccess}
        />
      </div>
    </div>
  );
}
