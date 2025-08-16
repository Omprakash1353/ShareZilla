import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import download from "js-file-download";
import { toast } from "sonner";

import type { AppThunk } from "..";
import { DataType, PeerConnection } from "@/helpers/peer";
import {
  addConnectionList,
  removeConnectionList,
} from "@/store/connection/connectionSlice";

export interface PeerState {
  readonly id?: string;
  readonly loading: boolean;
  readonly started: boolean;
}

export const initialState: PeerState = {
  id: undefined,
  loading: false,
  started: false,
};

const peerSlice = createSlice({
  name: "peer",
  initialState,
  reducers: {
    startPeerSession(state, action: PayloadAction<string>) {
      state.id = action.payload;
      state.started = true;
    },
    stopPeerSession() {
      return { ...initialState };
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { startPeerSession, stopPeerSession, setLoading } =
  peerSlice.actions;

export const startPeer = (): AppThunk => async (dispatch) => {
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
        console.info(
          "Receiving file " + file.fileName + " from " + peerId,
          file
        );
        if (file.dataType === DataType.FILE) {
          toast.success("File " + file.fileName + " is ready to download");
          download(file.file || "", file.fileName || "fileName", file.fileType);
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

export default peerSlice.reducer;
