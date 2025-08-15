import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";

interface ScannerModalProps {
  show: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function ScannerModal({
  show,
  onClose,
  onScanSuccess,
}: ScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (show && videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          onScanSuccess(result.data);
          onClose();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScanner.start();

      return () => {
        qrScanner.stop();
        qrScanner.destroy();
      };
    }
  }, [show, onScanSuccess, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-black">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <video ref={videoRef} style={{ width: "100%" }} />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
