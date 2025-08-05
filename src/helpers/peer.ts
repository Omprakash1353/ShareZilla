import Peer, {
  type DataConnection,
  type PeerError,
  type PeerErrorType,
} from "peerjs";
import { toast } from "sonner";

export enum DataType {
  FILE = "FILE",
  CHUNK = "CHUNK",
  OTHER = "OTHER",
}

export interface Data {
  dataType: DataType;
  chunk?: ArrayBuffer;
  chunkIndex?: number;
  totalChunks?: number;
  file?: Blob;
  fileName?: string;
  fileType?: string;
  fileId?: string;
  message?: string;
  progress?: number;
}

let peer: Peer | undefined;
const connectionMap = new Map<string, DataConnection>();

export const PeerConnection = {
  getPeer(): Peer | undefined {
    return peer;
  },

  startPeerSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        peer = new Peer();
        peer.on("open", (id) => {
          console.log("My ID: " + id);
          resolve(id);
        });
        peer.on("error", (err) => {
          console.log(err);
          toast.error(err.message);
          reject(err);
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  closePeerSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (peer) {
        peer.destroy();
        peer = undefined;
        resolve();
      } else {
        reject(new Error("Peer doesn't start yet"));
      }
    });
  },

  connectPeer(id: string): Promise<void> {
    if (!peer) {
      return Promise.reject(new Error("Peer doesn't start yet"));
    }

    if (connectionMap.has(id)) {
      return Promise.reject(new Error("Connection existed"));
    }

    if (peer.id === id) {
      return Promise.reject(new Error("You have entered your own ID"));
    }

    return new Promise((resolve, reject) => {
      try {
        const conn = peer?.connect(id, { reliable: true });
        if (!conn) {
          reject(new Error("Connection can't be established"));
        } else {
          conn
            .on("open", () => {
              console.log("Connect to: " + id);
              connectionMap.set(id, conn);
              peer?.removeListener("error", handlePeerError);
              resolve();
            })
            .on("error", (err) => {
              console.log(err);
              peer?.removeListener("error", handlePeerError);
              reject(err);
            });

          const handlePeerError = (err: PeerError<`${PeerErrorType}`>) => {
            if (err.type === "peer-unavailable") {
              const messageSplit = err.message.split(" ");
              const peerId = messageSplit[messageSplit.length - 1];
              if (id === peerId) reject(err);
            }
          };
          peer?.on("error", handlePeerError);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  onIncomingConnection(callback: (conn: DataConnection) => void): void {
    peer?.on("connection", (conn) => {
      console.log("Incoming connection: " + conn.peer);
      connectionMap.set(conn.peer, conn);
      callback(conn);
    });
  },

  onConnectionDisconnected(id: string, callback: () => void): void {
    if (!peer) {
      throw new Error("Peer doesn't start yet");
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection didn't exist");
    }
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("close", () => {
        console.log("Connection closed: " + id);
        connectionMap.delete(id);
        callback();
      });
    }
  },

  sendConnection(id: string, data: Data): Promise<void> {
    if (!connectionMap.has(id)) {
      return Promise.reject(new Error("Connection didn't exist"));
    }
    return new Promise((resolve, reject) => {
      try {
        const conn = connectionMap.get(id);
        if (conn) {
          conn.send(data);
        }
      } catch (err) {
        reject(err);
      }
      resolve();
    });
  },

  onConnectionReceiveData(id: string, callback: (f: Data) => void): void {
    if (!peer) {
      throw new Error("Peer doesn't start yet");
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection didn't exist");
    }
    const conn = connectionMap.get(id);
    if (conn) {
      conn.on("data", (receivedData) => {
        console.log("Receiving data from " + id);
        const data = receivedData as Data;
        callback(data);
      });
    }
  },
};
