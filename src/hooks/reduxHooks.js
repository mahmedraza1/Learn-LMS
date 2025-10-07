// Redux-based hook replacements for existing context hooks
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchUserData, 
  selectUser, 
  selectIsAdmin, 
  selectIsStudent, 
  selectIsGuest, 
  selectAuthLoading, 
  selectAuthError,
  clearAuth,
  clearError as clearAuthError
} from '../store/slices/authSlice';
import {
  selectBatches,
  selectCourses,
  selectSelectedBatch,
  selectBatchLoading,
  setSelectedBatch,
  initializeBatchData
} from '../store/slices/batchSlice';
import {
  fetchLecturesForBatch,
  fetchAnnouncementsForBatch,
  addLecture,
  deleteLecture,
  updateLecture,
  addCourseAnnouncement,
  updateCourseAnnouncement,
  deleteCourseAnnouncement,
  selectLectures,
  selectAnnouncements,
  selectLectureLoading,
  selectLectureError,
  clearLectures,
  clearAnnouncements,
  clearError as clearLectureError,
  updateLecturesWithDayField
} from '../store/slices/lectureSlice';
import {
  fetchGlobalAnnouncements,
  addGlobalAnnouncement,
  updateGlobalAnnouncement,
  deleteGlobalAnnouncement,
  selectGlobalAnnouncements,
  selectAnnouncementLoading,
  selectAnnouncementError,
  clearError as clearAnnouncementError
} from '../store/slices/announcementSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/learnlive';
  }
  return 'http://localhost:3001/learnlive';
};

const API_BASE_URL = getApiBaseUrl();

// Auth hook replacement
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStudent = useAppSelector(selectIsStudent);
  const isGuest = useAppSelector(selectIsGuest);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const refetch = () => dispatch(fetchUserData());
  const logout = () => dispatch(clearAuth());
  const clearErrorState = () => dispatch(clearAuthError());

  return {
    user,
    isAdmin,
    isStudent,
    isGuest,
    loading,
    error,
    refetch,
    logout,
    clearError: clearErrorState
  };
};

// Batch hook replacement
export const useBatch = () => {
  const dispatch = useAppDispatch();
  const batches = useAppSelector(selectBatches);
  const courses = useAppSelector(selectCourses);
  const selectedBatch = useAppSelector(selectSelectedBatch);
  const loading = useAppSelector(selectBatchLoading);

  const setSelectedBatchAction = (batch) => dispatch(setSelectedBatch(batch));
  const initializeBatch = (userData) => dispatch(initializeBatchData(userData));

  return {
    batches,
    courses,
    selectedBatch,
    loading,
    setSelectedBatch: setSelectedBatchAction,
    initializeBatch
  };
};

// Lecture hook replacement
export const useLecture = () => {
  const dispatch = useAppDispatch();
  const lectures = useAppSelector(selectLectures);
  const announcements = useAppSelector(selectAnnouncements);
  const loading = useAppSelector(selectLectureLoading);
  const error = useAppSelector(selectLectureError);
  const courses = useAppSelector(selectCourses);
  const selectedBatch = useAppSelector(selectSelectedBatch);

  const fetchLectures = (batchName) => dispatch(fetchLecturesForBatch(batchName));
  const fetchAnnouncements = (batchName) => dispatch(fetchAnnouncementsForBatch(batchName));
  const addNewLecture = (courseId, lectureData) => {
    return dispatch(addLecture({ 
      courseId, 
      lectureData, 
      selectedBatch 
    }));
  };
  const removeLecture = (lectureId, courseId) => {
    return dispatch(deleteLecture({ lectureId, courseId, selectedBatch }));
  };
  const updateExistingLecture = (courseId, lectureId, lectureData) => {
    return dispatch(updateLecture({ lectureId, lectureData, courseId }));
  };
  const clearLectureData = () => dispatch(clearLectures());
  const clearAnnouncementData = () => dispatch(clearAnnouncements());
  const clearErrorState = () => dispatch(clearLectureError());
  const updateLecturesDayField = (lectures) => dispatch(updateLecturesWithDayField({ lectures }));

  // Utility functions from original LectureContext - made reactive
  const getLecturesForCourse = useCallback((courseId) => {
    const courseIdString = String(courseId);
    return lectures[courseIdString] || [];
  }, [lectures]);

  const getAnnouncementsForCourse = useCallback((courseId) => {
    const courseIdString = String(courseId);
    const courseAnnouncements = announcements[courseIdString] || [];
    return [...courseAnnouncements].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [announcements]);

  // Calculate lecture dates based on batch
  const calculateLectureDates = (batchName) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const dates = [];
    
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    if (batchName === "Batch A") {
      let month = currentMonth;
      let year = currentYear;
      
      while (dates.length < 15) {
        const daysInMonth = Math.min(27, getDaysInMonth(year, month));
        let startDay = 1;
        
        for (let day = startDay; day <= daysInMonth && dates.length < 15; day++) {
          const date = new Date(year, month, day);
          dates.push(date);
        }
        
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else if (batchName === "Batch B") {
      let month = currentMonth;
      let year = currentYear;
      let firstIteration = true;
      
      while (dates.length < 15) {
        const daysInMonth = getDaysInMonth(year, month);
        let startDay = firstIteration ? 16 : 1;
        let endDay = firstIteration ? daysInMonth : 12;
        
        if (!firstIteration && daysInMonth === 31) {
          endDay = 30;
        }
        
        for (let day = startDay; day <= endDay && dates.length < 15; day++) {
          const date = new Date(year, month, day);
          dates.push(date);
        }
        
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        firstIteration = false;
      }
    }
    
    return dates;
  };

  // Helper function to find a course by ID
  const findCourseById = (courseId) => {
    let foundCourse = null;
    const parsedId = parseInt(courseId, 10);
    
    Object.keys(courses).forEach(batchName => {
      const coursesInBatch = courses[batchName] || [];
      const course = coursesInBatch.find(c => c.id === parsedId);
      if (course) {
        foundCourse = { ...course, batch: batchName };
      }
    });
    
    return foundCourse;
  };

  // Check if a course has a lecture scheduled for today
  const hasTodayLecture = (courseId) => {
    const course = findCourseById(courseId);
    if (!course) {
      return false;
    }
    
    const courseTitle = course.title;
    const courseBatch = course.batch;
    
    if (!courseTitle || !courseBatch) {
      return false;
    }
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0];
      
      // Get lectures for this course from Redux state
      const courseIdString = String(courseId);
      const courseLectures = lectures[courseIdString] || [];
      
      // Check if any lecture is scheduled for today
      const hasLectureToday = courseLectures.some(lecture => {
        if (!lecture.date) return false;
        
        const lectureDate = new Date(lecture.date);
        const lectureDateString = lectureDate.toISOString().split('T')[0];
        
        return lectureDateString === todayDateString;
      });
      
      return hasLectureToday;
    } catch (error) {
      console.error('Error checking today lecture:', error);
      return false;
    }
  };

  // Check if today is a valid lecture date
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

    // Add announcement function
  const addAnnouncement = async (courseId, announcementData) => {
    try {
      const result = await dispatch(addCourseAnnouncement({ 
        courseId, 
        announcementData, 
        selectedBatch 
      }));
      
      if (addCourseAnnouncement.fulfilled.match(result)) {
        return result.payload.announcement;
      } else {
        throw new Error(result.payload || 'Failed to add announcement');
      }
    } catch (error) {
      throw error;
    }
  };

  // Update announcement function
  const updateAnnouncement = async (courseId, announcementId, announcementData) => {
    try {
      const result = await dispatch(updateCourseAnnouncement({ 
        courseId, 
        announcementId, 
        announcementData,
        selectedBatch 
      }));
      
      if (updateCourseAnnouncement.fulfilled.match(result)) {
        return result.payload.announcement;
      } else {
        throw new Error(result.payload || 'Failed to update announcement');
      }
    } catch (error) {
      throw error;
    }
  };

  // Delete announcement function
  const deleteAnnouncement = async (courseId, announcementId) => {
    try {
      const result = await dispatch(deleteCourseAnnouncement({ 
        courseId, 
        announcementId,
        selectedBatch 
      }));
      
      if (deleteCourseAnnouncement.fulfilled.match(result)) {
        return true;
      } else {
        throw new Error(result.payload || 'Failed to delete announcement');
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    lectures,
    announcements,
    loading,
    error,
    fetchLectures,
    fetchAnnouncements,
    addLecture: addNewLecture,
    deleteLecture: removeLecture,
    updateLecture: updateExistingLecture,
    clearLectures: clearLectureData,
    clearAnnouncements: clearAnnouncementData,
    clearError: clearErrorState,
    updateLecturesWithDayField: updateLecturesDayField,
    // Utility functions
    getLecturesForCourse,
    getAnnouncementsForCourse,
    calculateLectureDates,
    findCourseById,
    hasTodayLecture,
    isToday,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  };
};

// Announcement hook replacement
export const useAnnouncement = () => {
  const dispatch = useAppDispatch();
  const globalAnnouncements = useAppSelector(selectGlobalAnnouncements);
  const loading = useAppSelector(selectAnnouncementLoading);
  const error = useAppSelector(selectAnnouncementError);

  const fetchGlobalAnnouncementsAction = () => dispatch(fetchGlobalAnnouncements());
  const addGlobalAnnouncementAction = (data) => dispatch(addGlobalAnnouncement(data));
  const updateGlobalAnnouncementAction = (id, data) => dispatch(updateGlobalAnnouncement({ id, updatedData: data }));
  const deleteGlobalAnnouncementAction = (id) => dispatch(deleteGlobalAnnouncement(id));
  const clearErrorState = () => dispatch(clearAnnouncementError());

  return {
    globalAnnouncements,
    loading,
    error,
    fetchGlobalAnnouncements: fetchGlobalAnnouncementsAction,
    addGlobalAnnouncement: addGlobalAnnouncementAction,
    updateGlobalAnnouncement: updateGlobalAnnouncementAction,
    deleteGlobalAnnouncement: deleteGlobalAnnouncementAction,
    clearError: clearErrorState
  };
};