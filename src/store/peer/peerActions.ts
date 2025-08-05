import type { Dispatch } from "@reduxjs/toolkit";
import download from "js-file-download";
import { toast } from "sonner";
import { DataType, PeerConnection } from "../../helpers/peer";
import {
  addConnectionList,
  removeConnectionList,
} from "../connection/connectionActions";
import { PeerActionType } from "./peerTypes";

export const startPeerSession = (id: string) => ({
  type: PeerActionType.PEER_SESSION_START,
  payload: { id },
});

export const stopPeerSession = () => ({
  type: PeerActionType.PEER_SESSION_STOP,
});

export const setLoading = (loading: boolean) => ({
  type: PeerActionType.PEER_LOADING,
  payload: { loading },
  loading,
});

export const startPeer: () => (dispatch: Dispatch) => Promise<void> =
  () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const id = await PeerConnection.startPeerSession();

      PeerConnection.onIncomingConnection((conn) => {
        const peerId = conn.peer;
        toast.info("Incoming connection: " + peerId);
        dispatch(addConnectionList(peerId));

        PeerConnection.onConnectionDisconnected(peerId, () => {
          toast.info("Connection closed: " + peerId);
          dispatch(removeConnectionList(peerId));
        });

        PeerConnection.onConnectionReceiveData(peerId, (file) => {
          toast.loading("Receiving file " + file.fileName + " from " + peerId);

          if (file.dataType === DataType.FILE) {
            download(
              file.file || "",
              file.fileName || "fileName",
              file.fileType
            );
          }
        });
      });
      dispatch(startPeerSession(id));
      dispatch(setLoading(false));
    } catch (err) {
      console.log(err);
      dispatch(setLoading(false));
    }
  };
