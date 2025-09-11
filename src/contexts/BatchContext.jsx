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
        
        // For now, create a placeholder structure for courses
        // This will be replaced with actual course data once we have that API
        const coursesData = {};
        availableBatches.forEach(batch => {
          coursesData[batch] = [
            {
              id: 1,
              title: "Example Course 1",
              batch: batch,
              lectures: []
            },
            {
              id: 2,
              title: "Example Course 2",
              batch: batch,
              lectures: []
            }
          ];
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
