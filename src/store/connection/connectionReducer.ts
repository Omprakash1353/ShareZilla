import { createReducer } from "@reduxjs/toolkit";
import { ConnectionActionType, type ConnectionState } from "./connectionTypes";

export const initialState: ConnectionState = {
  id: undefined,
  loading: false,
  list: [],
  selectedId: undefined,
};

export const ConnectionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      ConnectionActionType.CONNECTION_INPUT_CHANGE,
      (
        state,
        action: {
          type: ConnectionActionType.CONNECTION_INPUT_CHANGE;
          id: string;
        }
      ) => {
        state.id = action.id;
      }
    )
    .addCase(
      ConnectionActionType.CONNECTION_CONNECT_LOADING,
      (
        state,
        action: {
          type: ConnectionActionType.CONNECTION_CONNECT_LOADING;
          loading: boolean;
        }
      ) => {
        state.loading = action.loading;
      }
    )
    .addCase(
      ConnectionActionType.CONNECTION_LIST_ADD,
      (
        state,
        action: {
          type: ConnectionActionType.CONNECTION_LIST_ADD;
          id: string;
        }
      ) => {
        const newList = [...state.list, action.id];
        if (newList.length === 1) {
          state.selectedId = action.id;
        }
        state.list = newList;
      }
    )
    .addCase(
      ConnectionActionType.CONNECTION_LIST_REMOVE,
      (
        state,
        action: {
          type: ConnectionActionType.CONNECTION_LIST_REMOVE;
          id: string;
        }
      ) => {
        const newList = state.list.filter((e) => e !== action.id);
        if (state.selectedId === action.id) {
          state.selectedId = newList[0] || undefined;
        }
        state.list = newList;
      }
    )
    .addCase(
      ConnectionActionType.CONNECTION_ITEM_SELECT,
      (
        state,
        action: {
          type: ConnectionActionType.CONNECTION_ITEM_SELECT;
          id: string;
        }
      ) => {
        state.selectedId = action.id;
      }
    );
});
