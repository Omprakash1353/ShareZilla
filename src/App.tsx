import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { QRCodeScanner } from "@/components/common/ScannerModal";
import { DownloadedFiles } from "@/components/file/DownloadedFiles";
import { FileUploader } from "@/components/file/FileUploader";
import { UploadingFiles } from "@/components/file/UploadingFiles";
import { ConnectionManager } from "@/components/session/ConnectionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleReceivedChunk } from "@/helpers/file-transfer";
import { DataType, PeerConnection } from "@/helpers/peer";
import {
  selectUploadedFiles,
  setDownloadedFile,
  setReceiveProgress,
  setReceivingFileName,
} from "@/store/file/fileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { startPeer } from "@/store/peer/peerSlice";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/layout/Hero";
import { Badge } from "./components/ui/badge";

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: Date;
  status: "completed" | "error" | "uploading";
  data?: ArrayBuffer;
}

export default function FileShare() {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const uploadedFiles = useSelector(selectUploadedFiles);

  const fileState = useAppSelector((state) => state.file);
  const dispatch = useAppDispatch();

  const [showQRScanner, setShowQRScanner] = useState(false);

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
            (file, fileName, type) => {
              dispatch(setDownloadedFile({ file, fileName, type }));
              toast.success(`File received: ${fileName}`);
            }
          );
        }
      });
    }
  }, [connection.selectedId, dispatch]);

  const handleStartSession = () => dispatch(startPeer());

  return (
    <div className="flex flex-col gap-6 mx-auto">
      <div className="w-full mx-auto">
        <main className="flex flex-col gap-8">
          {!peer.started ? (
            <div>
              <Hero
                handleStartSession={handleStartSession}
                loading={connection.loading}
              />
              <Footer />
            </div>
          ) : (
            <div className="mt-6 text-center max-w-7xl mx-auto">
              <div className="flex items-center flex-col lg:flex-row justify-center gap-2 mb-4">
                <span>Your Device ID:</span>
                <Badge variant="secondary" className="font-mono">
                  {peer.id}
                </Badge>
                <Badge
                  variant={connection.list.length > 0 ? "default" : "secondary"}
                >
                  {connection.list.length} Connected
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <FileUploader />

                  <Tabs defaultValue="uploaded" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="uploaded">
                        Uploaded Files ({uploadedFiles.length})
                      </TabsTrigger>
                      <TabsTrigger value="received">
                        Received Files ({fileState.downloadedFiles.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="uploaded" className="mt-4">
                      <UploadingFiles />
                    </TabsContent>

                    <TabsContent value="received" className="mt-4">
                      <DownloadedFiles />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-6">
                  <ConnectionManager
                    onShowQRScanner={() => setShowQRScanner(true)}
                  />
                  {peer.id && <QRCodeGenerator peerId={peer.id} />}

                  {showQRScanner && (
                    <QRCodeScanner
                      open={showQRScanner}
                      onClose={() => setShowQRScanner(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
