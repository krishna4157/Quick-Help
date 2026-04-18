import { createSlice } from "@reduxjs/toolkit";
let initialState = {
  loading: false,
};
const slice = createSlice({
  name: "ui",
  initialState: initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload.loading;
    },
  },
});

export const uiReducer = slice.reducer;
export const uiActions = slice.actions;
