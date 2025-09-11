import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBatch } from './BatchContext';
import toast from 'react-hot-toast';

const LectureContext = createContext();

export const useLecture = () => useContext(LectureContext);

export const LectureProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { selectedBatch, courses } = useBatch();
  const [lectures, setLectures] = useState({});
  const [loading, setLoading] = useState(false);

  // Calculate lecture dates based on batch
  const calculateLectureDates = (batchName) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const dates = [];
    
    // According to requirements:
    // - Batch A: lectures on odd dates (1, 3, 5, ...)
    // - Batch B: lectures on even dates (2, 4, 6, ...)
    for (let day = 1; day <= daysInMonth; day++) {
      const isBatchADate = day % 2 === 1;
      const isBatchBDate = day % 2 === 0;
      
      if ((batchName === "Batch A" && isBatchADate) || 
          (batchName === "Batch B" && isBatchBDate)) {
        dates.push(new Date(currentYear, currentMonth, day));
      }
    }
    
    // Limit to 15 lectures as per requirements
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
      
      // In a real app, this would make an API call
      // For now, we'll just update the local state
      
      // Create a new lecture object
      const newLecture = {
        id: Date.now(), // Use timestamp as a placeholder ID
        course_id: courseId,
        title: lectureData.title,
        youtube_url: lectureData.youtubeUrl,
        date: lectureData.date
      };
      
      setLectures(prev => {
        const updatedLectures = { ...prev };
        if (!updatedLectures[courseId]) {
          updatedLectures[courseId] = [];
        }
        updatedLectures[courseId] = [...updatedLectures[courseId], newLecture];
        return updatedLectures;
      });
      
      toast.success('Lecture added successfully');
    } catch (err) {
      toast.error(`Failed to add lecture: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing lecture
  const updateLecture = async (courseId, lectureId, lectureData) => {
    try {
      setLoading(true);
      
      // In a real app, this would make an API call
      // For now, we'll just update the local state
      setLectures(prev => {
        const updatedLectures = { ...prev };
        if (updatedLectures[courseId]) {
          updatedLectures[courseId] = updatedLectures[courseId].map(lecture => 
            lecture.id === lectureId ? { ...lecture, ...lectureData } : lecture
          );
        }
        return updatedLectures;
      });
      
      toast.success('Lecture updated successfully');
    } catch (err) {
      toast.error(`Failed to update lecture: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a lecture
  const deleteLecture = async (courseId, lectureId) => {
    try {
      setLoading(true);
      
      // In a real app, this would make an API call
      // For now, we'll just update the local state
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
      toast.error(`Failed to delete lecture: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get lectures for a specific course
  const getLecturesForCourse = (courseId) => {
    return lectures[courseId] || [];
  };

  const value = {
    lectures,
    loading,
    calculateLectureDates,
    isToday,
    addLecture,
    updateLecture,
    deleteLecture,
    getLecturesForCourse
  };

  return <LectureContext.Provider value={value}>{children}</LectureContext.Provider>;
};
