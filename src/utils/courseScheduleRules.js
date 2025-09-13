/**
 * Course schedule rules based on the Lecture Delivering System Upgraded.md file
 * This file serves as a single source of truth for course scheduling rules
 */

// Courses for Batch A on odd dates
export const ODD_DATE_BATCH_A_COURSES = [
  "Video Editing",
  "Digital Marketing", // Normalized casing for compatibility
  "WordPress",
  "Search Engine Optimization",
  "Affiliate Marketing",
  "Amazon Virtual Assistant",
  "Graphics Designing",
  "Content Writing"
];

// Courses for Batch B on odd dates
export const ODD_DATE_BATCH_B_COURSES = [
  "Artificial Intelligence Prompt",
  "Full Stack Web Development",
  "Freelancing",
  "Shopify Dropshipping",
  "YouTube Creator",
  "MS Office and Digital Literacy",
  "English Language and Communication"
];

/**
 * Get courses that should have lectures on a specific date for each batch
 * @param {Date} date - The date to check
 * @returns {Object} - Object with batch keys and arrays of course names
 */
export const getCoursesForDate = (date = new Date()) => {
  // Determine if the date is odd or even
  const isOddDate = date.getDate() % 2 === 1;
  
  // For odd dates: Batch A gets oddDateBatchA, Batch B gets oddDateBatchB
  // For even dates: Batch A gets oddDateBatchB, Batch B gets oddDateBatchA
  return {
    "Batch A": isOddDate ? ODD_DATE_BATCH_A_COURSES : ODD_DATE_BATCH_B_COURSES,
    "Batch B": isOddDate ? ODD_DATE_BATCH_B_COURSES : ODD_DATE_BATCH_A_COURSES
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
  // Check if the date is a Friday (day 5)
  if (date.getDay() === 5) {
    return {
      isValid: false,
      message: "Lectures are not allowed on Fridays (Leave day)"
    };
  }
  
  // Get the day of month
  const dayOfMonth = date.getDate();
  
  // Check batch-specific date rules
  if (batchName === "Batch A") {
    if (dayOfMonth > 27) {
      return {
        isValid: false,
        message: "Batch A lectures only run from 1st to 27th of each month"
      };
    }
  } else if (batchName === "Batch B") {
    // Check if it's the 31st of the month
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (lastDayOfMonth === 31 && dayOfMonth === 31) {
      return {
        isValid: false,
        message: "The 31st is a leave day for Batch B"
      };
    }
    
    // Check if date is within the allowed range (16th to end of month, or 1st to 12th of next month)
    const isSecondHalfOfMonth = dayOfMonth >= 16;
    const isFirstHalfOfNextMonth = dayOfMonth <= 12;
    
    if (!isSecondHalfOfMonth && !isFirstHalfOfNextMonth) {
      return {
        isValid: false,
        message: "Batch B lectures run from 16th to end of month, and 1st to 12th of next month"
      };
    }
  }
  
  // Check course-specific scheduling based on odd/even date
  if (!shouldCourseHaveLecture(courseTitle, batchName, date)) {
    const isOddDate = date.getDate() % 2 === 1;
    const dateType = isOddDate ? "odd" : "even";
    return {
      isValid: false,
      message: `This course is not scheduled for ${dateType} dates according to the Class Arrangement rules`
    };
  }
  
  // If we got here, the date is valid
  return {
    isValid: true,
    message: "Date is valid for this course"
  };
};
