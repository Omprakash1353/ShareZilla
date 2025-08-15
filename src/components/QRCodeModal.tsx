import QRCodeDisplay from "./QRCodeDisplay";

interface Props {
  id: string;
  onClose: () => void;
  setShowFileScanner: (show: boolean) => void;
}

export default function QRCodeModal({ id, onClose, setShowFileScanner }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <QRCodeDisplay id={id} />
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setShowFileScanner(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Scan from Image
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
