import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import download from "js-file-download";
import { toast } from "sonner";

import type { AppThunk } from "..";
import { DataType, PeerConnection } from "../../helpers/peer";

export interface ConnectionState {
  readonly id?: string;
  readonly loading: boolean;
  readonly list: string[];
  readonly selectedId?: string;
}

export const initialState: ConnectionState = {
  id: undefined,
  loading: false,
  list: [],
  selectedId: undefined,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    changeConnectionInput(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    addConnectionList(state, action: PayloadAction<string>) {
      const newList = [...state.list, action.payload];
      if (newList.length === 1) {
        state.selectedId = action.payload;
      }
      state.list = newList;
    },
    removeConnectionList(state, action: PayloadAction<string>) {
      const newList = state.list.filter((e) => e !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = newList[0] || undefined;
      }
      state.list = newList;
    },
    selectItem(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
  },
});

export const {
  changeConnectionInput,
  setLoading,
  addConnectionList,
  removeConnectionList,
  selectItem,
} = connectionSlice.actions;

export const connectPeer =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(setLoading(true));

    try {
      await PeerConnection.connectPeer(id);

      PeerConnection.onConnectionDisconnected(id, () => {
        toast.info("Connection closed: " + id);
        dispatch(removeConnectionList(id));
      });

      PeerConnection.onConnectionReceiveData(id, (file) => {
        toast.info("Receiving file " + file.fileName + " from " + id);

        console.info("Receiving", file);

        if (file.dataType === DataType.FILE) {
          download(file.file || "", file.fileName || "fileName", file.fileType);
        }
      });

      dispatch(addConnectionList(id));
      dispatch(setLoading(false));
    } catch (err: unknown) {
      dispatch(setLoading(false));
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

export default connectionSlice.reducer;
