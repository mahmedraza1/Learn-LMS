import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getCoursesForDate, shouldCourseHaveLecture } from '../../utils/courseScheduleRules';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  // Check if we're running on lms.learn.pk
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/learnlive';
  }
  // Default to localhost
  return 'http://localhost:3001/learnlive';
};

const API_BASE_URL = getApiBaseUrl();

// Async thunks
export const fetchLecturesForBatch = createAsyncThunk(
  'lecture/fetchLecturesForBatch',
  async (batchName, { rejectWithValue }) => {
    try {
      // Ensure the batch name is in the correct format (Batch A or Batch B)
      // The API expects "Batch A" or "Batch B", not just "A" or "B"
      const formattedBatchName = batchName.includes("Batch") ? batchName : `Batch ${batchName}`;
      const response = await axios.get(`${API_BASE_URL}/lectures/${formattedBatchName}`);
      
      let lecturesData = {};
      
      // Handle the data structure where lectures are nested under 'lectures'
      if (response.data && response.data.lectures) {
        lecturesData = response.data.lectures || {};
      } else {
        lecturesData = response.data || {};
      }
      
      return { batchName: formattedBatchName, lectures: lecturesData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnnouncementsForBatch = createAsyncThunk(
  'lecture/fetchAnnouncementsForBatch',
  async (batchName, { rejectWithValue }) => {
    try {
      const formattedBatchName = batchName.includes("Batch") ? batchName : `Batch ${batchName}`;
      const response = await axios.get(`${API_BASE_URL}/announcements/${formattedBatchName}`);
      
      let announcementsData = {};
      
      // Handle the data structure where announcements are nested under 'announcements'
      if (response.data && response.data.announcements) {
        announcementsData = response.data.announcements || {};
      } else {
        announcementsData = response.data || {};
      }
      
      return { batchName: formattedBatchName, announcements: announcementsData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addLecture = createAsyncThunk(
  'lecture/addLecture',
  async ({ courseId, lectureData, selectedBatch }, { rejectWithValue }) => {
    try {
      // Use the lecture date from form, or current date as fallback
      const lectureDate = lectureData.lectureDate || new Date().toISOString().split('T')[0];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dateObj = new Date(lectureDate);
      const dayOfWeek = days[dateObj.getDay()];
      
      const newLecture = {
        title: lectureData.lectureName,
        youtube_url: lectureData.youtubeUrl,
        date: lectureDate,
        time: lectureData.lectureTime,
        day: dayOfWeek,
        course_id: parseInt(courseId),
        batch: selectedBatch,
        delivered: false,
        currentlyLive: false,
        id: Date.now()
      };

      // Server expects { lecture: lectureData }
      const response = await axios.post(`${API_BASE_URL}/lectures/${selectedBatch}/${courseId}`, {
        lecture: newLecture
      });
      return { courseId, lecture: response.data };
    } catch (error) {
      console.error('Add lecture error:', error);
      toast.error('Failed to add lecture');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLecture = createAsyncThunk(
  'lecture/deleteLecture',
  async ({ lectureId, courseId, selectedBatch }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/lectures/${selectedBatch}/${courseId}/${lectureId}`);
      return { lectureId, courseId };
    } catch (error) {
      toast.error('Failed to delete lecture');
      return rejectWithValue(error.message);
    }
  }
);

export const updateLecture = createAsyncThunk(
  'lecture/updateLecture',
  async ({ lectureId, lectureData, courseId }, { rejectWithValue }) => {
    try {
      console.log('Updating lecture:', lectureId, 'with data:', lectureData);
      const response = await axios.put(`${API_BASE_URL}/lectures/${lectureId}`, lectureData);
      console.log('Update response:', response.data);
      return { courseId, lecture: response.data };
    } catch (error) {
      console.error('Update lecture error:', error);
      toast.error('Failed to update lecture');
      return rejectWithValue(error.message);
    }
  }
);

export const addCourseAnnouncement = createAsyncThunk(
  'lecture/addCourseAnnouncement',
  async ({ courseId, announcementData, selectedBatch }, { rejectWithValue }) => {
    try {
      const announcement = {
        ...announcementData,
        id: Date.now(),
        date: new Date().toISOString(),
        courseId: parseInt(courseId)
      };

      // Server expects { announcement: announcementData }
      const response = await axios.post(`${API_BASE_URL}/announcements/${selectedBatch}/${courseId}`, {
        announcement: announcement
      });
      return { courseId, announcement: response.data };
    } catch (error) {
      toast.error('Failed to add announcement');
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourseAnnouncement = createAsyncThunk(
  'lecture/updateCourseAnnouncement',
  async ({ courseId, announcementId, announcementData, selectedBatch }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/announcements/${selectedBatch}/${courseId}/${announcementId}`, announcementData);
      return { courseId, announcement: response.data };
    } catch (error) {
      toast.error('Failed to update announcement');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourseAnnouncement = createAsyncThunk(
  'lecture/deleteCourseAnnouncement',
  async ({ courseId, announcementId, selectedBatch }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/announcements/${selectedBatch}/${courseId}/${announcementId}`);
      return { courseId, announcementId };
    } catch (error) {
      toast.error('Failed to delete announcement');
      return rejectWithValue(error.message);
    }
  }
);

const lectureSlice = createSlice({
  name: 'lecture',
  initialState: {
    lectures: {},
    announcements: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearLectures: (state) => {
      state.lectures = {};
    },
    clearAnnouncements: (state) => {
      state.announcements = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLecturesWithDayField: (state, action) => {
      const { lectures } = action.payload;
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      Object.keys(lectures).forEach(courseId => {
        if (Array.isArray(lectures[courseId])) {
          lectures[courseId] = lectures[courseId].map(lecture => {
            if (!lecture.day && lecture.date) {
              const lectureDate = new Date(lecture.date);
              const dayOfWeek = days[lectureDate.getDay()];
              return { ...lecture, day: dayOfWeek };
            }
            return lecture;
          });
        }
      });
      
      state.lectures = lectures;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lectures
      .addCase(fetchLecturesForBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLecturesForBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = action.payload.lectures;
      })
      .addCase(fetchLecturesForBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch announcements
      .addCase(fetchAnnouncementsForBatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnnouncementsForBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.announcements;
      })
      .addCase(fetchAnnouncementsForBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add lecture
      .addCase(addLecture.fulfilled, (state, action) => {
        const { courseId, lecture } = action.payload;
        const courseIdString = String(courseId);
        if (!state.lectures[courseIdString]) {
          state.lectures[courseIdString] = [];
        }
        state.lectures[courseIdString].push(lecture);
      })
      // Delete lecture
      .addCase(deleteLecture.fulfilled, (state, action) => {
        const { lectureId, courseId } = action.payload;
        const courseIdString = String(courseId);
        if (state.lectures[courseIdString]) {
          state.lectures[courseIdString] = state.lectures[courseIdString].filter(
            lecture => lecture.id !== lectureId
          );
        }
      })
      // Update lecture
      .addCase(updateLecture.fulfilled, (state, action) => {
        const { courseId, lecture } = action.payload;
        const courseIdString = String(courseId);
        if (state.lectures[courseIdString]) {
          const index = state.lectures[courseIdString].findIndex(l => l.id === lecture.id);
          if (index !== -1) {
            state.lectures[courseIdString][index] = lecture;
          }
        }
      })
      // Add course announcement
      .addCase(addCourseAnnouncement.fulfilled, (state, action) => {
        const { courseId, announcement } = action.payload;
        const courseIdString = String(courseId);
        if (!state.announcements[courseIdString]) {
          state.announcements[courseIdString] = [];
        }
        state.announcements[courseIdString].unshift(announcement);
      })
      // Update course announcement
      .addCase(updateCourseAnnouncement.fulfilled, (state, action) => {
        const { courseId, announcement } = action.payload;
        const courseIdString = String(courseId);
        if (state.announcements[courseIdString]) {
          const index = state.announcements[courseIdString].findIndex(a => a.id === announcement.id);
          if (index !== -1) {
            state.announcements[courseIdString][index] = announcement;
          }
        }
      })
      // Delete course announcement
      .addCase(deleteCourseAnnouncement.fulfilled, (state, action) => {
        const { courseId, announcementId } = action.payload;
        const courseIdString = String(courseId);
        if (state.announcements[courseIdString]) {
          state.announcements[courseIdString] = state.announcements[courseIdString].filter(
            a => a.id !== announcementId
          );
        }
      });
  },
});

// Selectors
export const selectLecture = (state) => state.lecture;
export const selectLectures = (state) => state.lecture.lectures;
export const selectAnnouncements = (state) => state.lecture.announcements;
export const selectLectureLoading = (state) => state.lecture.loading;
export const selectLectureError = (state) => state.lecture.error;

export const { clearLectures, clearAnnouncements, clearError, updateLecturesWithDayField } = lectureSlice.actions;
export default lectureSlice.reducer;