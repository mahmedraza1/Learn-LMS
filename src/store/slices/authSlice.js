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
  // Allow both 'Granted' and 'Trial' admission status
  return user && (user.admission_status === 'Granted' || user.admission_status === 'Trial');
};

// Selector to check if user is an upcoming batch student
export const selectIsUpcomingBatchStudent = (state) => {
  const user = state.auth.user;
  return user && 
         user.roles?.includes('student') && 
         user.upcoming_batch && 
         user.upcoming_batch !== 'Unassigned' &&
         (user.admission_status === 'Granted' || user.admission_status === 'Trial');
};

// Selector to check if user can access live lectures
export const selectCanAccessLiveLectures = (state) => {
  const user = state.auth.user;
  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('instructor');
  const isUpcomingStudent = selectIsUpcomingBatchStudent(state);
  
  // Admins can always access, upcoming batch students cannot
  return isAdmin || !isUpcomingStudent;
};

// Selector for fee status
export const selectFeeStatus = (state) => {
  const user = state.auth.user;
  return user?.fee_status || 'Unknown';
};

export const { clearAuth, clearError, updateUserBatch } = authSlice.actions;
export default authSlice.reducer;