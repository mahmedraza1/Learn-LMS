import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/api/courses');
      if (response.ok) {
        const courses = await response.json();
        return courses;
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addCourse = createAsyncThunk(
  'courses/addCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const course = {
        ...courseData,
        enrolledStudents: parseInt(courseData.enrolledStudents) || 0,
        rating: parseFloat(courseData.rating) || 0,
        totalRatings: parseInt(courseData.totalRatings) || 0
      };

      const response = await fetch('http://localhost:3001/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        const newCourse = await response.json();
        return newCourse;
      } else {
        throw new Error('Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const course = {
        ...courseData,
        enrolledStudents: parseInt(courseData.enrolledStudents) || 0,
        rating: parseFloat(courseData.rating) || 0,
        totalRatings: parseInt(courseData.totalRatings) || 0
      };

      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        return updatedCourse;
      } else {
        throw new Error('Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return id;
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  courses: [],
  loading: false,
  error: null,
};

// Slice
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCoursesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(course => course.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoursesError } = coursesSlice.actions;

// Selectors
export const selectCourses = (state) => state.courses.courses;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;

export default coursesSlice.reducer;