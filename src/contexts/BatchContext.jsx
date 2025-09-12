import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const BatchContext = createContext();

export const useBatch = () => useContext(BatchContext);

export const BatchProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || user.id === 0) return;

      try {
        setLoading(true);
        
        // Fetch user and batch information
        const batchRes = await fetch(
          `https://learn.pk/wp-json/custom/v1/me`,
          { credentials: 'include' }
        );

        if (!batchRes.ok) throw new Error('Failed to fetch user data');
        const userData = await batchRes.json();
        
        // Define available batches (from requirements)
        const availableBatches = ["Batch A", "Batch B"];
        setBatches(availableBatches);
        
        // Set default selected batch based on user role
        if (!isAdmin && userData.batch && userData.batch !== "Unassigned") {
          setSelectedBatch(userData.batch);
        } else if (isAdmin) {
          // For admins, select the first batch by default
          setSelectedBatch(availableBatches[0]);
        }
        
        // Use the actual courses from Courses.md
        const actualCourses = [
          "Graphics Designing",
          "Artificial Intelligence Prompt",
          "Affiliate Marketing",
          "Content Writing",
          "English Language and Communication",
          "Shopify Dropshipping",
          "Full Stack Web Development",
          "Search Engine Optimization",
          "MS Office and Digital Literacy",
          "Amazon Virtual Assistant",
          "YouTube Creator",
          "Freelancing",
          "WordPress",
          "Digital Marketing",
          "Video Editing"
        ];
        
        const coursesData = {};
        availableBatches.forEach(batch => {
          coursesData[batch] = actualCourses.map((title, index) => ({
            id: index + 1,
            title: title,
            batch: batch,
            lectures: []
          }));
        });
        
        setCourses(coursesData);
      } catch (err) {
        toast.error(`Error fetching batch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [user, isAdmin]);

  const value = {
    batches,
    courses,
    selectedBatch,
    setSelectedBatch,
    loading,
  };

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
};
