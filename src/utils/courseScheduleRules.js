/**
 * Course schedule rules based on the Lecture Delivering System Upgraded.md file
 * This file serves as a single source of truth for course scheduling rules
 */

// All 15 courses in order
export const ALL_COURSES = [
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

// First 8 courses (for Batch A on odd dates, Batch B on even dates)
export const FIRST_8_COURSES = ALL_COURSES.slice(0, 8);

// Last 7 courses (for Batch B on odd dates, Batch A on even dates)
export const LAST_7_COURSES = ALL_COURSES.slice(8);

/**
 * Get courses that should have lectures on a specific date for each batch
 * @param {Date} date - The date to check
 * @returns {Object} - Object with batch keys and arrays of course names
 */
export const getCoursesForDate = (date = new Date()) => {
  // Determine if the date is odd or even
  const isOddDate = date.getDate() % 2 === 1;
  
  // Odd dates: Batch A gets first 8 courses, Batch B gets last 7 courses
  // Even dates: Batch A gets last 7 courses, Batch B gets first 8 courses
  return {
    "Batch A": isOddDate ? FIRST_8_COURSES : LAST_7_COURSES,
    "Batch B": isOddDate ? LAST_7_COURSES : FIRST_8_COURSES
  };
};

/**
 * Check if a course should have a lecture on a specific date
 * @param {string} courseTitle - The title of the course
 * @param {string} batchName - The batch name (Batch A or Batch B)
 * @param {Date} date - The date to check
 * @returns {boolean} - Whether the course should have a lecture on this date
 */
export const shouldCourseHaveLecture = (courseTitle, batchName, date = new Date()) => {
  // Get courses for this date by batch
  const coursesByBatch = getCoursesForDate(date);
  
  // Get courses for the specified batch
  const coursesForBatch = coursesByBatch[batchName] || [];
  
  // Check if the course title is in the list for this batch and date
  return coursesForBatch.some(title => 
    title.toLowerCase().trim() === courseTitle.toLowerCase().trim()
  );
};

/**
 * Check if a date is valid for a course in a specific batch
 * @param {Date} date - The date to check
 * @param {string} courseTitle - The title of the course
 * @param {string} batchName - The batch name (Batch A or Batch B)
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateDateForCourse = (date, courseTitle, batchName) => {
  // Check if the date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
  
  if (date < today) {
    return {
      isValid: false,
      message: "Cannot schedule lectures for past dates"
    };
  }
  
  // Batch restrictions disabled - all future dates are valid
  return {
    isValid: true,
    message: "Date is valid for this course"
  };
};
