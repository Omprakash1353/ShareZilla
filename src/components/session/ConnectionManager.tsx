import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

import {
  changeConnectionInput,
  connectPeer,
  selectItem,
} from "@/store/connection/connectionSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface ConnectionManagerProps {
  setShowQRModal: (show: boolean) => void;
  setShowScanner: (show: boolean) => void;
  setShowFileScanner: (show: boolean) => void;
  handleStopSession: () => void;
}

export function ConnectionManager({
  setShowQRModal,
  setShowScanner,
  setShowFileScanner,
  handleStopSession,
}: ConnectionManagerProps) {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();

  const handleConnectOtherPeer = () => {
    if (connection.id) {
      dispatch(connectPeer(connection.id));
    } else {
      toast.error("Please enter a valid code");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="badge badge-outline">ID: {peer.id}</div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(peer.id || "");
            toast.info("Copied: " + peer.id);
          }}
          className="btn btn-ghost btn-sm"
        >
          <Copy className="size-4" /> Copy
        </button>
        <button className="btn btn-error btn-sm" onClick={handleStopSession}>
          Stop
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowQRModal(true)}
        >
          <QrCode className="size-4" />
          Show QR
        </button>
      </div>

      {/* Connect input */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter code"
          className="input input-bordered w-full"
          value={connection.id || ""}
          onChange={(e) => dispatch(changeConnectionInput(e.target.value))}
        />
        <button
          className="btn btn-info"
          onClick={handleConnectOtherPeer}
          disabled={connection.loading}
        >
          Connect
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowScanner(true)}
        >
          <QrCode className="size-4" />
          Scan
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowFileScanner(true)}
        >
          <QrCode className="size-4" />
          Scan from Image
        </button>
      </div>

      {/* Connection list */}
      {connection.list.length > 0 ? (
        <ul className="list bg-base-100 rounded-box shadow-md w-full">
          {connection.list.map((e, index) => (
            <li
              key={index}
              className={`list-row ${
                connection.selectedId === e && "bg-zinc-200"
              }`}
              onClick={() => {
                dispatch(selectItem(e));
              }}
            >
              {e}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">Waiting for connection...</p>
      )}
    </div>
  );
}
