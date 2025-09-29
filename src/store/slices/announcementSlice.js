import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Async thunks
export const fetchGlobalAnnouncements = createAsyncThunk(
  'announcement/fetchGlobalAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/global-announcements`);
      if (response.ok) {
        const announcements = await response.json();
        return announcements;
      } else {
        throw new Error('Failed to fetch global announcements');
      }
    } catch (error) {
      console.error('Failed to fetch global announcements:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addGlobalAnnouncement = createAsyncThunk(
  'announcement/addGlobalAnnouncement',
  async (announcementData, { rejectWithValue }) => {
    try {
      const announcement = {
        ...announcementData,
        date: new Date().toISOString(),
        id: Date.now() // Simple ID generation
      };

      const response = await fetch(`${API_BASE_URL}/global-announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcement),
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        return newAnnouncement;
      } else {
        throw new Error('Failed to save announcement');
      }
    } catch (error) {
      console.error('Error adding global announcement:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateGlobalAnnouncement = createAsyncThunk(
  'announcement/updateGlobalAnnouncement',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/global-announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        return updatedAnnouncement;
      } else {
        throw new Error('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating global announcement:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGlobalAnnouncement = createAsyncThunk(
  'announcement/deleteGlobalAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/global-announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return id;
      } else {
        throw new Error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting global announcement:', error);
      return rejectWithValue(error.message);
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcement',
  initialState: {
    globalAnnouncements: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch global announcements
      .addCase(fetchGlobalAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.globalAnnouncements = action.payload;
      })
      .addCase(fetchGlobalAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add global announcement
      .addCase(addGlobalAnnouncement.fulfilled, (state, action) => {
        state.globalAnnouncements.unshift(action.payload);
      })
      .addCase(addGlobalAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update global announcement
      .addCase(updateGlobalAnnouncement.fulfilled, (state, action) => {
        const index = state.globalAnnouncements.findIndex(
          announcement => announcement.id === action.payload.id
        );
        if (index !== -1) {
          state.globalAnnouncements[index] = action.payload;
        }
      })
      .addCase(updateGlobalAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete global announcement
      .addCase(deleteGlobalAnnouncement.fulfilled, (state, action) => {
        state.globalAnnouncements = state.globalAnnouncements.filter(
          announcement => announcement.id !== action.payload
        );
      })
      .addCase(deleteGlobalAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAnnouncement = (state) => state.announcement;
export const selectGlobalAnnouncements = (state) => state.announcement.globalAnnouncements;
export const selectAnnouncementLoading = (state) => state.announcement.loading;
export const selectAnnouncementError = (state) => state.announcement.error;

export const { clearError } = announcementSlice.actions;
export default announcementSlice.reducer;