import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {
    mobileNumber: null,
    biometricEnabled: false,
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUserData(state, action) {
      state.data = {
        ...action.payload,
        mobileNumber: action.payload.mobileNumber ?? null,
        biometricEnabled: action.payload.biometricEnabled ?? false,
      };
      state.error = null;
    },
    updateBiometricEnabled(state, action) {
      if (state.data) {
        state.data.biometricEnabled = action.payload;
      }
    },
    updateMobileNumber(state, action) {
      if (state.data) {
        state.data.mobileNumber = action.payload;
      }
    },
    clearUserData(state) {
      state.data = {
        mobileNumber: null,
        biometricEnabled: false,
      };
    },
    setUserLoading(state, action) {
      state.loading = action.payload;
    },
    setUserError(state, action) {
      state.error = action.payload;
    },
  },
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;
