import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import { ConnectionReducer } from "./connection/connectionReducer";
import { PeerReducer } from "./peer/peerReducer";
import fileReducer from "./file/fileSlice";

export const store = configureStore({
  reducer: {
    peer: PeerReducer,
    connection: ConnectionReducer,
    file: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

window.store = store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
