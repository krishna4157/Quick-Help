import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {
    mobileNumber: null,
    biometricEnabled: false,
    walletBalance: 0,
    pin: null, // ADD THIS
    referralCode: null, // ADD THIS
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
        walletBalance: action.payload.walletBalance ?? 0,
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
      // Reset to initial state - this will be persisted
      state.data = {
        mobileNumber: null,
        biometricEnabled: false,
        walletBalance: 0,
        pin: null, // ADD THIS
        referralCode: null, // ADD THIS
      };
      state.loading = false;
      state.error = null;
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
