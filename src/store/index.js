import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import batchReducer from './slices/batchSlice';
import lectureReducer from './slices/lectureSlice';
import announcementReducer from './slices/announcementSlice';
import liveClassAnnouncementReducer from './slices/liveClassAnnouncementSlice';
import coursesReducer from './slices/coursesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    batch: batchReducer,
    lecture: lectureReducer,
    announcement: announcementReducer,
    liveClassAnnouncement: liveClassAnnouncementReducer,
    courses: coursesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Export store instance for use in components
export default store;