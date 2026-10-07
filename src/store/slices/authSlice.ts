import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';

export interface AuthState {
  user: User | null;
  status: 'unknown' | 'authenticated' | 'anonymous';
}

const initialState: AuthState = { user: null, status: 'unknown' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    signedOut(state) {
      state.user = null;
      state.status = 'anonymous';
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;
