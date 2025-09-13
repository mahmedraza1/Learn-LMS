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
      if (!user) return;

      try {
        setLoading(true);
        
        // Define available batches (from requirements)
        const availableBatches = ["Batch A", "Batch B"];
        setBatches(availableBatches);
        
        // Set default selected batch based on user role and attributes
        if (!isAdmin && user.batch && user.batch !== "Unassigned") {
          // Format the batch name correctly if needed - ensure it's "Batch X" format
          const formattedBatch = user.batch.includes("Batch") ? 
            user.batch : 
            `Batch ${user.batch}`;
          setSelectedBatch(formattedBatch);
          
          // Also update the user object to use the correctly formatted batch name
          user.batch = formattedBatch;
        } else if (isAdmin) {
          // For admins, select the first batch by default
          setSelectedBatch(availableBatches[0]);
        } else if (!isAdmin) {
          // For students without a batch, assign to "Batch A" by default
          setSelectedBatch("Batch A");
          user.batch = "Batch A";
        }
        
        // Create courses specifically for each batch
        // This way, even though both batches have the same course titles,
        // they'll have different IDs and can be highlighted independently
        
        // All available courses according to Lecture Delivering System Upgraded.md
        const allCourses = [
          "Video Editing",
          "Digital Marketing",
          "WordPress",
          "Search Engine Optimization",
          "Affiliate Marketing",
          "Amazon Virtual Assistant",
          "Graphics Designing",
          "Content Writing",
          "Artificial Intelligence Prompt",
          "Full Stack Web Development",
          "Freelancing",
          "Shopify Dropshipping",
          "YouTube Creator",
          "MS Office and Digital Literacy",
          "English Language and Communication"
        ];
        
        // Initialize courses data structure
        const coursesData = {
          "Batch A": [],
          "Batch B": []
        };
        
        // Add courses to Batch A with IDs starting from 1
        allCourses.forEach((title, index) => {
          // Make sure each course's ID is unique across all batches
          coursesData["Batch A"].push({
            id: index + 1,
            title: title,
            batch: "Batch A",
            lectures: []
          });
        });
        
        // Add courses to Batch B with IDs starting from 101 (to avoid ID collisions)
        allCourses.forEach((title, index) => {
          coursesData["Batch B"].push({
            id: index + 101, // Use different ID range for Batch B
            title: title,
            batch: "Batch B",
            lectures: []
          });
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
