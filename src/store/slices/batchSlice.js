import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { updateUserBatch } from './authSlice';

// Async thunk for initializing batch data
export const initializeBatchData = createAsyncThunk(
  'batch/initializeBatchData',
  async ({ user, isAdmin }, { dispatch, rejectWithValue }) => {
    try {
      if (!user) return null;

      // Define available batches (from requirements)
      const availableBatches = ["Batch A", "Batch B"];
      
      let selectedBatch = null;
      let needsUserBatchUpdate = false;
      let newUserBatch = null;
      
      // Set default selected batch based on user role and attributes
      if (!isAdmin && user.batch && user.batch !== "Unassigned") {
        // Format the batch name correctly if needed - ensure it's "Batch X" format
        const formattedBatch = user.batch.includes("Batch") ? 
          user.batch : 
          `Batch ${user.batch}`;
        selectedBatch = formattedBatch;
        
        // If we had to format the batch name, update the user object
        if (formattedBatch !== user.batch) {
          needsUserBatchUpdate = true;
          newUserBatch = formattedBatch;
        }
      } else if (isAdmin) {
        // For admins, select the first batch by default
        selectedBatch = availableBatches[0];
      } else if (!isAdmin) {
        // For students without a batch, assign to "Batch A" by default
        selectedBatch = "Batch A";
        needsUserBatchUpdate = true;
        newUserBatch = "Batch A";
      }
      
      // Update user batch if needed
      if (needsUserBatchUpdate && newUserBatch) {
        dispatch(updateUserBatch(newUserBatch));
      }
      
        // Create courses for each batch
        // Both batches will have all 15 courses, but different ones will be highlighted based on date
        
        // All available courses in order
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
        
        // Add all 15 courses to both batches
        allCourses.forEach((title, index) => {
          // Batch A courses with IDs 1-15
          coursesData["Batch A"].push({
            id: index + 1,
            title: title,
            batch: "Batch A",
            lectures: []
          });
          
          // Batch B courses with IDs 101-115 (to avoid ID collisions)
          coursesData["Batch B"].push({
            id: index + 101,
            title: title,
            batch: "Batch B",
            lectures: []
          });
        });      return {
        batches: availableBatches,
        courses: coursesData,
        selectedBatch
      };
    } catch (err) {
      toast.error(`Error initializing batch data: ${err.message}`);
      return rejectWithValue(err.message);
    }
  }
);

const batchSlice = createSlice({
  name: 'batch',
  initialState: {
    batches: [],
    courses: {},
    selectedBatch: null,
    loading: false,
    userBatchUpdate: null, // Store batch update for user if needed
  },
  reducers: {
    setBatches: (state, action) => {
      state.batches = action.payload;
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    setSelectedBatch: (state, action) => {
      state.selectedBatch = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserBatchUpdate: (state, action) => {
      state.userBatchUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeBatchData.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeBatchData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.batches = action.payload.batches;
          state.courses = action.payload.courses;
          state.selectedBatch = action.payload.selectedBatch;
        }
      })
      .addCase(initializeBatchData.rejected, (state, action) => {
        state.loading = false;
        console.error('Failed to initialize batch data:', action.payload);
      });
  },
});

// Selectors
export const selectBatch = (state) => state.batch;
export const selectBatches = (state) => state.batch.batches;
export const selectCourses = (state) => state.batch.courses;
export const selectSelectedBatch = (state) => state.batch.selectedBatch;
export const selectBatchLoading = (state) => state.batch.loading;

export const { setBatches, setCourses, setSelectedBatch, setLoading, setUserBatchUpdate } = batchSlice.actions;
export default batchSlice.reducer;