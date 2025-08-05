import type { PayloadAction } from "@reduxjs/toolkit";
import { createReducer } from "@reduxjs/toolkit";
import type { PeerState } from "./peerTypes";
import { PeerActionType } from "./peerTypes";

type StartSessionAction = PayloadAction<
  { id: string },
  PeerActionType.PEER_SESSION_START
>;
type SetLoadingAction = PayloadAction<
  { loading: boolean },
  PeerActionType.PEER_LOADING
>;

export const initialState: PeerState = {
  id: undefined,
  loading: false,
  started: false,
};

export const PeerReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      PeerActionType.PEER_SESSION_START,
      (state, action: StartSessionAction) => {
        state.id = action.payload.id;
        state.started = true;
      }
    )
    .addCase(PeerActionType.PEER_SESSION_STOP, () => {
      return { ...initialState };
    })
    .addCase(PeerActionType.PEER_LOADING, (state, action: SetLoadingAction) => {
      state.loading = action.payload.loading;
    });
});
