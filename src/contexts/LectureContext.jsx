import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBatch } from './BatchContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const LectureContext = createContext();

export const useLecture = () => useContext(LectureContext);

export const LectureProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { selectedBatch, courses } = useBatch();
  const [lectures, setLectures] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch lectures on mount or when batch changes
  useEffect(() => {
    if (selectedBatch) {
      fetchLecturesForBatch(selectedBatch);
    }
  }, [selectedBatch]);

  // Fetch all lectures for a specific batch
  const fetchLecturesForBatch = async (batchName) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/lectures/${batchName}`);
      setLectures(response.data || {});
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  // Calculate lecture dates based on batch
  const calculateLectureDates = (batchName) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    const currentYear = currentDate.getFullYear();
    const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;
    
    const dates = [];
    
    // Batch A: From 1st of current month to 1st of next month, only odd dates
    // Batch B: From 15th of current month to 15th of next month, only even dates
    
    if (batchName === "Batch A") {
      // Starting day for Batch A is 1st of current month
      const startDay = 1;
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Add odd dates from current month
      for (let day = startDay; day <= daysInCurrentMonth && dates.length < 15; day += 2) {
        dates.push(new Date(currentYear, currentMonth, day));
      }
      
      // Continue with odd dates in next month if needed
      let day = 1;
      while (dates.length < 15 && day <= 15) {
        dates.push(new Date(nextMonthYear, nextMonth, day));
        day += 2;
      }
    } else if (batchName === "Batch B") {
      // Starting day for Batch B is 15th (or 16th if we want even) of current month
      const startDay = 16; // First even day from the 15th
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Add even dates from 16th of current month
      for (let day = startDay; day <= daysInCurrentMonth && dates.length < 15; day += 2) {
        dates.push(new Date(currentYear, currentMonth, day));
      }
      
      // Continue with even dates in next month if needed
      let day = 2; // First even date of month
      while (dates.length < 15 && day <= 16) { // Up to 16th of next month (including)
        dates.push(new Date(nextMonthYear, nextMonth, day));
        day += 2;
      }
    }
    
    return dates.slice(0, 15);
  };

  // Function to check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Add a new lecture
  const addLecture = async (courseId, lectureData) => {
    try {
      setLoading(true);
      
      // Extract YouTube video ID for proper thumbnail
      const videoId = extractYouTubeId(lectureData.youtubeUrl);
      
      // Find the course to get its batch
      let courseBatch = null;
      Object.keys(courses).forEach(batch => {
        const course = courses[batch].find(c => c.id === courseId);
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      // Calculate the appropriate date based on batch and lecture number
      const existingLectures = lectures[courseId] || [];
      const lectureNumber = existingLectures.length + 1;
      
      // Get the dates for this batch - this will now follow the correct scheduling:
      // Batch A: From 1st of month, odd dates (1,3,5...)
      // Batch B: From 15th/16th of month, even dates (16,18,20...)
      const batchDates = calculateLectureDates(courseBatch);
      
      // Use the appropriate date based on lecture number
      const lectureDate = lectureNumber <= batchDates.length 
        ? batchDates[lectureNumber - 1] 
        : new Date(); // Fallback to today if we've run out of scheduled dates
      
      // Create a new lecture object with auto-generated title
      const newLecture = {
        course_id: courseId,
        title: `Lecture ${lectureNumber}`, // Auto-generate title based on lecture number
        youtube_url: lectureData.youtubeUrl,
        youtube_id: videoId,
        lecture_number: lectureNumber,
        date: lectureDate.toISOString() // Store as ISO string
      };
      
      // Send to API
      const response = await axios.post(
        `${API_BASE_URL}/lectures/${courseBatch}/${courseId}`, 
        { lecture: newLecture }
      );
      
      // Update local state with the returned lecture (which includes the server-generated ID)
      setLectures(prev => {
        const updatedLectures = { ...prev };
        if (!updatedLectures[courseId]) {
          updatedLectures[courseId] = [];
        }
        updatedLectures[courseId] = [...updatedLectures[courseId], response.data];
        return updatedLectures;
      });
      
      toast.success('Lecture added successfully');
      return response.data;
    } catch (err) {
      console.error('Error adding lecture:', err);
      toast.error(`Failed to add lecture: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    try {
      // Handle different YouTube URL formats
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      // Format: https://youtu.be/VIDEO_ID
      // Format: https://www.youtube.com/embed/VIDEO_ID
      
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        // Short URL format: https://youtu.be/VIDEO_ID
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/watch')) {
        // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        // Embed URL: https://www.youtube.com/embed/VIDEO_ID
        const parts = url.split('embed/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      return videoId;
    } catch (err) {
      console.error("Error extracting YouTube ID:", err);
      return null;
    }
  };

  // Update an existing lecture
  const updateLecture = async (courseId, lectureId, lectureData) => {
    try {
      setLoading(true);
      
      // Find the course to get its batch
      let courseBatch = null;
      Object.keys(courses).forEach(batch => {
        const course = courses[batch].find(c => c.id === courseId);
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      // First, get the current lecture to preserve fields we don't want to overwrite
      const currentLecture = lectures[courseId]?.find(lecture => lecture.id === lectureId);
      
      if (!currentLecture) {
        throw new Error("Lecture not found");
      }
      
      // Extract YouTube video ID if URL is being updated
      let youtubeId = null;
      if (lectureData.youtube_url) {
        youtubeId = extractYouTubeId(lectureData.youtube_url);
      }
      
      // Create updated lecture object while preserving certain fields
      const updatedLecture = {
        ...currentLecture,
        ...lectureData,
        // Keep these fields from original lecture
        id: lectureId,
        title: currentLecture.title,
        lecture_number: currentLecture.lecture_number,
        // Add YouTube ID if URL was updated
        ...(youtubeId && { youtube_id: youtubeId })
      };
      
      // Convert date to ISO string if it's a Date object
      if (updatedLecture.date instanceof Date) {
        updatedLecture.date = updatedLecture.date.toISOString();
      }
      
      // Send to API
      const response = await axios.post(
        `${API_BASE_URL}/lectures/${courseBatch}/${courseId}`, 
        { lecture: updatedLecture }
      );
      
      // Update local state
      setLectures(prev => {
        const updatedLectures = { ...prev };
        if (updatedLectures[courseId]) {
          updatedLectures[courseId] = updatedLectures[courseId].map(lecture => 
            lecture.id === lectureId ? response.data : lecture
          );
        }
        return updatedLectures;
      });
      
      toast.success('Lecture updated successfully');
      return response.data;
    } catch (err) {
      console.error('Error updating lecture:', err);
      toast.error(`Failed to update lecture: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a lecture
  const deleteLecture = async (courseId, lectureId) => {
    try {
      setLoading(true);
      
      // Find the course to get its batch
      let courseBatch = null;
      Object.keys(courses).forEach(batch => {
        const course = courses[batch].find(c => c.id === courseId);
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      // Send delete request to API
      await axios.delete(`${API_BASE_URL}/lectures/${courseBatch}/${courseId}/${lectureId}`);
      
      // Update local state
      setLectures(prev => {
        const updatedLectures = { ...prev };
        if (updatedLectures[courseId]) {
          updatedLectures[courseId] = updatedLectures[courseId].filter(lecture => 
            lecture.id !== lectureId
          );
        }
        return updatedLectures;
      });
      
      toast.success('Lecture deleted successfully');
    } catch (err) {
      console.error('Error deleting lecture:', err);
      toast.error(`Failed to delete lecture: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get lectures for a specific course
  const getLecturesForCourse = (courseId) => {
    return lectures[courseId] || [];
  };
  
  // Fetch lectures for a specific course (used for refreshing data)
  const fetchLecturesForCourse = async (courseId) => {
    try {
      // Find the course to get its batch
      let courseBatch = null;
      Object.keys(courses).forEach(batch => {
        const course = courses[batch].find(c => c.id === courseId);
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/lectures/${courseBatch}/${courseId}`);
      
      // Update only this course's lectures
      setLectures(prev => {
        const updatedLectures = { ...prev };
        updatedLectures[courseId] = response.data || [];
        return updatedLectures;
      });
      
      return response.data || [];
    } catch (err) {
      console.error('Error fetching lectures for course:', err);
      toast.error(`Failed to load lectures: ${err.response?.data?.message || err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    lectures,
    loading,
    calculateLectureDates,
    isToday,
    addLecture,
    updateLecture,
    deleteLecture,
    getLecturesForCourse,
    fetchLecturesForBatch,
    fetchLecturesForCourse
  };

  return <LectureContext.Provider value={value}>{children}</LectureContext.Provider>;
};
