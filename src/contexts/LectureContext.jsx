import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBatch } from './BatchContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getCoursesForDate, shouldCourseHaveLecture } from '../utils/courseScheduleRules';

// Using learnlive prefix to match server configuration
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

const LectureContext = createContext();

export const useLecture = () => useContext(LectureContext);

export const LectureProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { selectedBatch, courses } = useBatch();
  const [lectures, setLectures] = useState({});
  const [announcements, setAnnouncements] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch lectures and announcements on mount or when batch changes
  useEffect(() => {
    if (selectedBatch) {
      fetchLecturesForBatch(selectedBatch).then(updatedLectures => {
        // After fetching, ensure all lectures have a day field
        updateLecturesWithDayField(updatedLectures);
      });
      fetchAnnouncementsForBatch(selectedBatch);
    }
  }, [selectedBatch]);
  
  // Helper function to add day field to lectures that don't have it
  const updateLecturesWithDayField = async (fetchedLectures) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const updatedLectures = { ...fetchedLectures };
    let lecturesNeedingUpdate = [];
    
    // Check each lecture in each course
    Object.keys(updatedLectures).forEach(courseId => {
      if (Array.isArray(updatedLectures[courseId])) {
        updatedLectures[courseId] = updatedLectures[courseId].map(lecture => {
          // If lecture doesn't have a day field, add it
          if (!lecture.day && lecture.date) {
            const lectureDate = new Date(lecture.date);
            const dayOfWeek = days[lectureDate.getDay()];
            const updatedLecture = { ...lecture, day: dayOfWeek };
            lecturesNeedingUpdate.push(updatedLecture);
            return updatedLecture;
          }
          return lecture;
        });
      }
    });
    
    // If any lectures were updated, update the state and server
    if (lecturesNeedingUpdate.length > 0) {
      console.log(`Found ${lecturesNeedingUpdate.length} lectures that need day field updates`);
      setLectures(updatedLectures);
      
      // Update each lecture on the server
      try {
        for (const lecture of lecturesNeedingUpdate) {
          console.log(`Updating lecture ${lecture.id} with day: ${lecture.day}`);
          await axios.put(`${API_BASE_URL}/lectures/${lecture.id}`, lecture);
        }
        toast.success(`Updated ${lecturesNeedingUpdate.length} lectures with day information`);
      } catch (error) {
        console.error('Error updating lectures with day field:', error);
        toast.error('Failed to update some lectures with day information');
      }
    }
  };

  // Fetch all lectures for a specific batch
  const fetchLecturesForBatch = async (batchName) => {
    try {
      setLoading(true);
      // Ensure the batch name is in the correct format (Batch A or Batch B)
      // The API expects "Batch A" or "Batch B", not just "A" or "B"
      const formattedBatchName = batchName.includes("Batch") ? batchName : `Batch ${batchName}`;
      console.log(`Fetching lectures for batch: ${formattedBatchName}`);
      const response = await axios.get(`${API_BASE_URL}/lectures/${formattedBatchName}`);
      
      let lecturesData = {};
      
      // Handle the data structure where lectures are nested under 'lectures'
      if (response.data && response.data.lectures) {
        lecturesData = response.data.lectures || {};
      } else {
        lecturesData = response.data || {};
      }
      
      setLectures(lecturesData);
      return lecturesData; // Return the lectures data for further processing
      
    } catch (error) {
      console.error('Error fetching lectures:', error);
      
      // Check if the error might be related to an ad blocker
      if (error.message === 'Network Error' || error.code === 'ERR_BLOCKED_BY_CLIENT') {
        toast.error(
          'It seems your ad blocker is preventing API requests. Please disable your ad blocker to use this site properly.',
          { duration: 6000 }
        );
      } else {
        toast.error('Failed to load lectures');
      }
      return {}; // Return empty object in case of error
    } finally {
      setLoading(false);
    }
  };

  // Calculate lecture dates based on batch
  const calculateLectureDates = (batchName) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const dates = [];
    
    // Function to get days in month
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    // Function to check if a date is Friday (day 5) - no longer used as Friday restriction has been removed
    // const isFriday = (date) => {
    //   return date.getDay() === 5; // 5 is Friday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // };
    
    // Implement the rules from "Lecture Delivering System Upgraded.md"
    if (batchName === "Batch A") {
      // Batch A runs from 1st to 27th of each month
      let month = currentMonth;
      let year = currentYear;
      
      // Continue until we have 15 valid dates
      while (dates.length < 15) {
        const daysInMonth = Math.min(27, getDaysInMonth(year, month)); // Max day is 27th for Batch A
        let startDay = 1; // Always start from 1st
        
        // Add dates for this month (Friday restriction removed)
        for (let day = startDay; day <= daysInMonth && dates.length < 15; day++) {
          const date = new Date(year, month, day);
          dates.push(date);
        }
        
        // Move to next month
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else if (batchName === "Batch B") {
      // Batch B runs from 16th of current month to the 12th of next month
      let month = currentMonth;
      let year = currentYear;
      let firstIteration = true;
      
      // Continue until we have 15 valid dates
      while (dates.length < 15) {
        const daysInMonth = getDaysInMonth(year, month);
        
        // In first iteration, start from 16th; in subsequent months, start from 1st
        let startDay = firstIteration ? 16 : 1;
        
        // End day is either end of month (first iteration) or 12th of month (subsequent iterations)
        let endDay = firstIteration ? daysInMonth : 12;
        
        // If the last day of the month is 31 and we're in the next month (not first iteration),
        // then the 31st is a leave day according to the rules
        if (!firstIteration && daysInMonth === 31) {
          endDay = 30; // Skip the 31st
        }
        
        // Add dates for this range (Friday restriction removed)
        for (let day = startDay; day <= endDay && dates.length < 15; day++) {
          const date = new Date(year, month, day);
          dates.push(date);
        }
        
        // Move to next month
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
      
      // Get existing lectures for this course to determine lecture number
      const existingLectures = lectures[courseId] || [];
      const lectureNumber = existingLectures.length + 1;
      
      // Parse the provided date and time
      let lectureDateTime;
      if (lectureData.lectureDate) {
        // Create date from the provided lecture date and time
        const dateParts = lectureData.lectureDate.split('-').map(part => parseInt(part, 10));
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Month is 0-indexed
        
        // Friday validation removed
        
        // If time is provided, set it
        if (lectureData.lectureTime) {
          const timeParts = lectureData.lectureTime.split(':').map(part => parseInt(part, 10));
          date.setHours(timeParts[0], timeParts[1], 0);
        }
        
        lectureDateTime = date;
      } else {
        // Use the system's automatic scheduling as fallback
        const batchDates = calculateLectureDates(courseBatch);
        lectureDateTime = lectureNumber <= batchDates.length 
          ? batchDates[lectureNumber - 1] 
          : new Date();
      }
      
      // Get day of week
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = days[lectureDateTime.getDay()];
      
      // Create a new lecture object
      const newLecture = {
        course_id: courseId,
        title: lectureData.lectureName || `Lecture ${lectureNumber}`,
        youtube_url: lectureData.youtubeUrl,
        youtube_id: videoId,
        lecture_number: lectureNumber,
        date: lectureDateTime.toISOString(),
        time: lectureData.lectureTime ? convertTo12HourFormat(lectureData.lectureTime) : '',
        day: dayOfWeek, // Include the day of the week
        delivered: false
      };
      
      // Send to API
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.post(
        `${API_BASE_URL}/lectures/${formattedBatchName}/${courseId}`, 
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
  
  // Convert time from 24-hour format to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24h) => {
    if (!time24h) return '';
    
    try {
      // Parse the time in 24-hour format (HH:MM)
      const [hours24, minutes] = time24h.split(':').map(num => parseInt(num, 10));
      
      // Convert to 12-hour format
      let hours12 = hours24 % 12;
      if (hours12 === 0) hours12 = 12; // Handle 00:00 (midnight) and 12:00 (noon)
      
      // Determine AM or PM
      const period = hours24 < 12 ? 'AM' : 'PM';
      
      // Format as HH:MM AM/PM
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (err) {
      console.error("Invalid time format", err);
      return time24h; // Return original if parsing fails
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
      if (lectureData.youtubeUrl) {
        youtubeId = extractYouTubeId(lectureData.youtubeUrl);
      }
      
      // Process the date and time if provided
      let lectureDateTime = null;
      let dayOfWeek = null;
      if (lectureData.lectureDate) {
        // Create date from the provided lecture date and time
        const dateParts = lectureData.lectureDate.split('-').map(part => parseInt(part, 10));
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Month is 0-indexed
        
        // Friday validation removed
        
        // Get day of week
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        dayOfWeek = days[date.getDay()];
        
        // If time is provided, set it
        if (lectureData.lectureTime) {
          const timeParts = lectureData.lectureTime.split(':').map(part => parseInt(part, 10));
          date.setHours(timeParts[0], timeParts[1], 0);
        }
        
        lectureDateTime = date;
      }
      
      // Create updated lecture object
      const updatedLecture = {
        ...currentLecture,
        // Update fields with new values if provided
        title: lectureData.lectureName || currentLecture.title,
        youtube_url: lectureData.youtubeUrl || currentLecture.youtube_url,
        // Keep these fields from original lecture
        id: lectureId,
        lecture_number: currentLecture.lecture_number,
        course_id: courseId,
        // Update date and time if provided
        date: lectureDateTime ? lectureDateTime.toISOString() : currentLecture.date,
        time: lectureData.lectureTime ? convertTo12HourFormat(lectureData.lectureTime) : currentLecture.time,
        // Update day if date was provided, otherwise keep the existing day
        day: dayOfWeek || currentLecture.day || (currentLecture.date ? new Date(currentLecture.date).toLocaleDateString('en-US', { weekday: 'long' }) : null),
        delivered: lectureData.delivered !== undefined ? lectureData.delivered : currentLecture.delivered,
        currentlyLive: lectureData.currentlyLive !== undefined ? lectureData.currentlyLive : currentLecture.currentlyLive,
        // Add YouTube ID if URL was updated
        youtube_id: youtubeId || currentLecture.youtube_id
      };
      
      // Send to API
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.post(
        `${API_BASE_URL}/lectures/${formattedBatchName}/${courseId}`, 
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
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      await axios.delete(`${API_BASE_URL}/lectures/${formattedBatchName}/${courseId}/${lectureId}`);
      
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
        const course = courses[batch].find(c => c.id === parseInt(courseId));
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      setLoading(true);
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.get(`${API_BASE_URL}/lectures/${formattedBatchName}/${courseId}`);
      
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

    // Fetch all announcements for a specific batch
  const fetchAnnouncementsForBatch = async (batchName) => {
    try {
      setLoading(true);
      // Ensure the batch name is in the correct format (Batch A or Batch B)
      const formattedBatchName = batchName.includes("Batch") ? batchName : `Batch ${batchName}`;
      console.log(`Fetching announcements for batch: ${formattedBatchName}`);
      const response = await axios.get(`${API_BASE_URL}/announcements/${formattedBatchName}`);
      // Handle the data structure where announcements are nested under 'announcements'
      if (response.data && response.data.announcements) {
        setAnnouncements(response.data.announcements || {});
      } else {
        setAnnouncements(response.data || {});
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      
      // Check if the error might be related to an ad blocker
      if (error.message === 'Network Error' || error.code === 'ERR_BLOCKED_BY_CLIENT') {
        toast.error(
          'It seems your ad blocker is preventing API requests. Please disable your ad blocker to use this site properly.',
          { duration: 6000 }
        );
      } else {
        toast.error('Failed to load announcements');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a new announcement
  const addAnnouncement = async (courseId, announcementData) => {
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
      
      // Create a new announcement object
      const newAnnouncement = {
        course_id: courseId,
        title: announcementData.title,
        content: announcementData.content,
        date: new Date().toISOString(),
        author: "Learn pk"
      };
      
      // Send to API
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.post(
        `${API_BASE_URL}/announcements/${formattedBatchName}/${courseId}`, 
        { announcement: newAnnouncement }
      );
      
      // Update local state with the returned announcement
      setAnnouncements(prev => {
        const updatedAnnouncements = { ...prev };
        if (!updatedAnnouncements[courseId]) {
          updatedAnnouncements[courseId] = [];
        }
        updatedAnnouncements[courseId] = [...updatedAnnouncements[courseId], response.data];
        return updatedAnnouncements;
      });
      
      toast.success('Announcement added successfully');
      return response.data;
    } catch (err) {
      console.error('Error adding announcement:', err);
      toast.error(`Failed to add announcement: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing announcement
  const updateAnnouncement = async (courseId, announcementId, announcementData) => {
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
      
      // First, get the current announcement
      const currentAnnouncement = announcements[courseId]?.find(a => a.id === announcementId);
      
      if (!currentAnnouncement) {
        throw new Error("Announcement not found");
      }
      
      // Create updated announcement object
      const updatedAnnouncement = {
        ...currentAnnouncement,
        title: announcementData.title || currentAnnouncement.title,
        content: announcementData.content || currentAnnouncement.content,
        updated_at: new Date().toISOString()
      };
      
      // Send to API
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.post(
        `${API_BASE_URL}/announcements/${formattedBatchName}/${courseId}`, 
        { announcement: updatedAnnouncement }
      );
      
      // Update local state
      setAnnouncements(prev => {
        const updatedAnnouncements = { ...prev };
        if (updatedAnnouncements[courseId]) {
          updatedAnnouncements[courseId] = updatedAnnouncements[courseId].map(announcement => 
            announcement.id === announcementId ? response.data : announcement
          );
        }
        return updatedAnnouncements;
      });
      
      toast.success('Announcement updated successfully');
      return response.data;
    } catch (err) {
      console.error('Error updating announcement:', err);
      toast.error(`Failed to update announcement: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (courseId, announcementId) => {
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
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      await axios.delete(`${API_BASE_URL}/announcements/${formattedBatchName}/${courseId}/${announcementId}`);
      
      // Update local state
      setAnnouncements(prev => {
        const updatedAnnouncements = { ...prev };
        if (updatedAnnouncements[courseId]) {
          updatedAnnouncements[courseId] = updatedAnnouncements[courseId].filter(announcement => 
            announcement.id !== announcementId
          );
        }
        return updatedAnnouncements;
      });
      
      toast.success('Announcement deleted successfully');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      toast.error(`Failed to delete announcement: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get announcements for a specific course, sorted by date (newest first)
  const getAnnouncementsForCourse = (courseId) => {
    const courseAnnouncements = announcements[courseId] || [];
    
    // Sort announcements by date (newest first)
    return [...courseAnnouncements].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  };
  
  // Fetch announcements for a specific course
  const fetchAnnouncementsForCourse = async (courseId) => {
    try {
      // Find the course to get its batch
      let courseBatch = null;
      Object.keys(courses).forEach(batch => {
        const course = courses[batch].find(c => c.id === parseInt(courseId));
        if (course) {
          courseBatch = course.batch;
        }
      });
      
      if (!courseBatch) {
        throw new Error("Course not found");
      }
      
      setLoading(true);
      // Ensure the batch name is formatted correctly
      const formattedBatchName = courseBatch.includes("Batch") ? courseBatch : `Batch ${courseBatch}`;
      const response = await axios.get(`${API_BASE_URL}/announcements/${formattedBatchName}/${courseId}`);
      
      // Update only this course's announcements
      setAnnouncements(prev => {
        const updatedAnnouncements = { ...prev };
        updatedAnnouncements[courseId] = response.data || [];
        return updatedAnnouncements;
      });
      
      return response.data || [];
    } catch (err) {
      console.error('Error fetching announcements for course:', err);
      toast.error(`Failed to load announcements: ${err.response?.data?.message || err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Determine which courses should have active lectures today based on the rules from "Lecture Delivering System Upgraded.md"
  const getActiveCoursesForToday = () => {
    // Use the current date
    const today = new Date();
    
    // Use the helper function from courseScheduleRules.js
    // This ensures consistent application of rules across the app
    return getCoursesForDate(today);
  };
  
  // Helper function to find a course by ID
  const findCourseById = (courseId) => {
    let foundCourse = null;
    const parsedId = parseInt(courseId, 10);
    
    console.log(`Searching for course with ID: ${courseId} (${parsedId})`);
    
    // Search in all batches
    Object.keys(courses).forEach(batchName => {
      const coursesInBatch = courses[batchName] || [];
      
      const course = coursesInBatch.find(c => c.id === parsedId);
      if (course) {
        console.log(`Found course:`, course);
        // Ensure the batch information is included
        foundCourse = { ...course, batch: batchName };
      }
    });
    
    return foundCourse;
  };

  // Check if a course has a lecture scheduled for today
  const hasTodayLecture = (courseId) => {
    // Find the course to get its title and batch
    const course = findCourseById(courseId);
    if (!course) {
      console.log(`Course with ID ${courseId} not found`);
      return false;
    }
    
    const courseTitle = course.title;
    const courseBatch = course.batch;
    
    if (!courseTitle || !courseBatch) {
      console.log(`Course ${courseId} missing title or batch`, course);
      return false;
    }
    
    // Use current date for determining today's lectures
    const today = new Date();
    const isOddDate = today.getDate() % 2 === 1;
    
    // Following your trick: For even dates, invert the logic
    // This means: on even dates, show lectures that would be closed on odd dates
    // and vice versa
    
    // Get the list of courses that should have lectures today by batch
    const activeCoursesMap = getCoursesForDate(today);
    
    console.log(`ACTIVE COURSE CHECK - Date: ${today.toDateString()} (${isOddDate ? 'ODD' : 'EVEN'})`);
    console.log(`Batch A active courses:`, activeCoursesMap["Batch A"]);
    console.log(`Batch B active courses:`, activeCoursesMap["Batch B"]);
    console.log(`Checking course "${courseTitle}" in "${courseBatch}"`);
    
    // Only check the active courses for THIS course's batch
    const activeCoursesList = activeCoursesMap[courseBatch] || [];
    
    // Check if this specific course should be active today in THIS batch
    const isActive = activeCoursesList.some(title => {
      const matches = title.toLowerCase().trim() === courseTitle.toLowerCase().trim();
      if (matches) {
        console.log(`MATCH FOUND: "${title}" === "${courseTitle}"`);
      }
      return matches;
    });
    
    // Detailed debugging info
    console.log(`LECTURE CHECK (${today.toDateString()}, ${isOddDate ? 'ODD' : 'EVEN'} date):`);
    console.log(`Course "${courseTitle}" in ${courseBatch}, ID: ${courseId}`);
    console.log(`Should have lecture today: ${isActive ? 'YES' : 'NO'}`);
    
    return isActive;
  };

  const value = {
    lectures,
    announcements,
    loading,
    calculateLectureDates,
    isToday,
    addLecture,
    updateLecture,
    deleteLecture,
    getLecturesForCourse,
    fetchLecturesForBatch,
    fetchLecturesForCourse,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncementsForCourse,
    fetchAnnouncementsForBatch,
    fetchAnnouncementsForCourse,
    getActiveCoursesForToday,
    hasTodayLecture
  };

  return <LectureContext.Provider value={value}>{children}</LectureContext.Provider>;
};
