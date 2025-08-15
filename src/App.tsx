import { useEffect, useState } from "react";
import { toast } from "sonner";
import FileScannerModal from "./components/common/FileScannerModal";
import ScannerModal from "./components/common/ScannerModal";
import DownloadedFiles from "./components/file/DownloadedFiles";
import FileUploader from "./components/file/FileUploader";
import UploadingFiles from "./components/file/UploadingFiles";
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
  resetProgress,
  setDownloadedFile,
  setFileUploadError,
  setReceivingFileName,
  setReceiveProgress,
  updateFileUploadProgress,
} from "./store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerSlice";

export default function FileShare() {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const [fileList, setFileList] = useState<File[]>([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showFileScanner, setShowFileScanner] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setFileList((prev) => [...prev, ...acceptedFiles]);
  };

  useEffect(() => {
    if (fileList.length > 0 && connection.selectedId) {
      handleUpload();
    }
  }, [fileList, connection.selectedId]);

  useEffect(() => {
    if (connection.selectedId) {
      PeerConnection.onConnectionReceiveData(connection.selectedId, (data) => {
        if (data.dataType === DataType.CHUNK) {
          if (data.fileName) {
            dispatch(setReceivingFileName(data.fileName));
          }
          handleReceivedChunk(
            data,
            (progress) => {
              const progressPercent = Math.round(progress * 100);
              dispatch(setReceiveProgress(progressPercent));
            },
            (file, fileName) => {
              dispatch(setDownloadedFile({ file, fileName }));
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
  };

  const handleUpload = async () => {
    if (fileList.length === 0) return toast.warning("Please select files");
    if (!connection.selectedId)
      return toast.warning("Please select a connected user");

    setSendLoading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileId = fileState.uploadedFiles[i].id;

        await sendFileInChunks(
          file,
          connection.selectedId,
          fileId,
          (progress) => {
            const progressPercent = Math.round(progress * 100);
            dispatch(
              updateFileUploadProgress({ fileId, progress: progressPercent })
            );
          }
        );

        dispatch(updateFileUploadProgress({ fileId, progress: 100 }));
      }

      toast.success("All files sent successfully");
      setFileList([]);
    } catch (err) {
      console.error(err);
      toast.error("Error sending files");
      fileState.uploadedFiles.forEach((file) => {
        if (file.status === "uploading") {
          dispatch(setFileUploadError(file.id));
        }
      });
    } finally {
      setSendLoading(false);
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

              <UploadingFiles />

              <FileUploader
                onDrop={onDrop}
                isUploading={fileState.uploadedFiles.some(
                  (f) => f.status === "uploading"
                )}
              />

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