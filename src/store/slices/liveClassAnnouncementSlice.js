import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api/learnlive';
  }
  return 'http://localhost:3001/api/learnlive';
};

const API_BASE_URL = getApiBaseUrl();

// Async thunks
export const fetchLiveClassAnnouncement = createAsyncThunk(
  "liveClassAnnouncement/fetchLiveClassAnnouncement",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/live-class-announcement`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch live class announcement");
    }
  }
);

export const setLiveClassAnnouncement = createAsyncThunk(
  "liveClassAnnouncement/setLiveClassAnnouncement", 
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/live-class-announcement`, announcementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to set live class announcement");
    }
  }
);

export const clearLiveClassAnnouncement = createAsyncThunk(
  "liveClassAnnouncement/clearLiveClassAnnouncement",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/live-class-announcement`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear live class announcement");
    }
  }
);

const liveClassAnnouncementSlice = createSlice({
  name: "liveClassAnnouncement",
  initialState: {
    announcement: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch live class announcement
      .addCase(fetchLiveClassAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveClassAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcement = action.payload;
      })
      .addCase(fetchLiveClassAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Set live class announcement
      .addCase(setLiveClassAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setLiveClassAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcement = action.payload;
      })
      .addCase(setLiveClassAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear live class announcement
      .addCase(clearLiveClassAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearLiveClassAnnouncement.fulfilled, (state) => {
        state.loading = false;
        state.announcement = null;
      })
      .addCase(clearLiveClassAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectLiveClassAnnouncement = (state) => state.liveClassAnnouncement.announcement;
export const selectLiveClassAnnouncementLoading = (state) => state.liveClassAnnouncement.loading;
export const selectLiveClassAnnouncementError = (state) => state.liveClassAnnouncement.error;

export default liveClassAnnouncementSlice.reducer;