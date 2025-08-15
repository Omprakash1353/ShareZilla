import QrScanner from "qr-scanner";
import React, { useRef } from "react";
import { toast } from "sonner";

interface FileScannerModalProps {
  show: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const FileScannerModal: React.FC<FileScannerModalProps> = ({
  show,
  onClose,
  onScanSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      onScanSuccess(result.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to scan QR code from image.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-black">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code from Image</h2>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileScan}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FileScannerModal;
