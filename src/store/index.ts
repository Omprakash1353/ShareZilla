import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";

import connectionReducer from "@/store/connection/connectionSlice";
import fileReducer from "@/store/file/fileSlice";
import peerReducer from "@/store/peer/peerSlice";

export const store = configureStore({
  reducer: {
    peer: peerReducer,
    connection: connectionReducer,
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
