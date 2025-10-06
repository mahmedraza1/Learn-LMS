import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('https://learn.pk/wp-json/custom/v1/me', {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch user data');
      
      const userData = await res.json();
      return userData;
    } catch (err) {
      toast.error(`Authentication error: ${err.message}`);
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserBatch: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, batch: action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => {
  const user = state.auth.user;
  return user?.roles?.includes('administrator') || user?.roles?.includes('instructor');
};
export const selectIsStudent = (state) => {
  const user = state.auth.user;
  return user?.roles?.includes('student');
};
export const selectIsGuest = (state) => {
  const user = state.auth.user;
  return !user || user.id === 0;
};

// New selector for admission status
export const selectHasGrantedAdmission = (state) => {
  const user = state.auth.user;
  // Only return true if user exists AND has specifically granted admission
  return user && user.admission_status === 'Granted';
};

export const { clearAuth, clearError, updateUserBatch } = authSlice.actions;
export default authSlice.reducer;