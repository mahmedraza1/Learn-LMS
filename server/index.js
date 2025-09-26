const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to data files
const dataFilePath = path.join(__dirname, 'data', 'lectures.json');
const coursesFilePath = path.join(__dirname, 'data', 'courses.json');
const miscFilePath = path.join(__dirname, 'data', 'miscellaneous.json');
const groupsFilePath = path.join(__dirname, 'data', 'groups.json');
const courseOverviewsFilePath = path.join(__dirname, 'data', 'course-overviews.json');
const courseAnnouncementsFilePath = path.join(__dirname, 'data', 'course-announcements.json');

// Helper function to read the lectures data
const readLecturesData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading lectures data:', err);
    return { 
      "Batch A": {
        lectures: {},
        announcements: {}
      }, 
      "Batch B": {
        lectures: {},
        announcements: {}
      }
    };
  }
};

// Helper function to write the lectures data
const writeLecturesData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing lectures data:', err);
    return false;
  }
};

// Helper function to read the courses data
const readCoursesData = () => {
  try {
    const data = fs.readFileSync(coursesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading courses data:', err);
    return { courses: [] };
  }
};

// Helper function to write the courses data
const writeCoursesData = (data) => {
  try {
    fs.writeFileSync(coursesFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Courses data written successfully');
    return true;
  } catch (err) {
    console.error('Error writing courses data:', err);
    return false;
  }
};

// Helper function to read the miscellaneous data
const readMiscData = () => {
  try {
    const data = fs.readFileSync(miscFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading miscellaneous data:', err);
    return { 
      dashboardVideo: {
        title: "Welcome to Learn-Live Platform",
        description: "Get started with your learning journey. This introduction video will help you navigate the platform and make the most of your courses.",
        videoUrl: "https://youtu.be/jfKfPfyJRdk",
        videoType: "youtube",
        isActive: true,
        updatedAt: new Date().toISOString(),
        updatedBy: "System"
      }
    };
  }
};

// Helper function to write the miscellaneous data
const writeMiscData = (data) => {
  try {
    fs.writeFileSync(miscFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Miscellaneous data written successfully');
    return true;
  } catch (err) {
    console.error('Error writing miscellaneous data:', err);
    return false;
  }
};

// Helper function to read the groups data
const readGroupsData = () => {
  try {
    const data = fs.readFileSync(groupsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading groups data:', err);
    return { groups: [] };
  }
};

// Helper function to write the groups data
const writeGroupsData = (data) => {
  try {
    fs.writeFileSync(groupsFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Groups data written successfully');
    return true;
  } catch (err) {
    console.error('Error writing groups data:', err);
    return false;
  }
};

// Helper function to read the course overviews data
const readCourseOverviewsData = () => {
  try {
    const data = fs.readFileSync(courseOverviewsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading course overviews data:', err);
    return { overviews: {} };
  }
};

// Helper function to write the course overviews data
const writeCourseOverviewsData = (data) => {
  try {
    fs.writeFileSync(courseOverviewsFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Course overviews data written successfully');
    return true;
  } catch (err) {
    console.error('Error writing course overviews data:', err);
    return false;
  }
};

// Helper function to read the course announcements data
const readCourseAnnouncementsData = () => {
  try {
    const data = fs.readFileSync(courseAnnouncementsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading course announcements data:', err);
    return { announcements: {} };
  }
};

// Helper function to write the course announcements data
const writeCourseAnnouncementsData = (data) => {
  try {
    fs.writeFileSync(courseAnnouncementsFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Course announcements data written successfully');
    return true;
  } catch (err) {
    console.error('Error writing course announcements data:', err);
    return false;
  }
};

// GET all lectures
app.get('/learnlive/lectures', (req, res) => {
  const lecturesData = readLecturesData();
  res.json(lecturesData);
});

// GET lectures and announcements for a specific batch
app.get('/learnlive/lectures/:batch', (req, res) => {
  const { batch } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch]) {
    res.json(lecturesData[batch]);
  } else {
    res.status(404).json({ message: `Batch "${batch}" not found` });
  }
});

// GET lectures for a specific course in a batch
app.get('/learnlive/lectures/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch] && lecturesData[batch].lectures && lecturesData[batch].lectures[courseId]) {
    res.json(lecturesData[batch].lectures[courseId]);
  } else {
    res.status(404).json({ message: `Course ${courseId} in batch "${batch}" not found` });
  }
});

// GET all announcements for a batch
app.get('/learnlive/announcements/:batch', (req, res) => {
  const { batch } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch] && lecturesData[batch].announcements) {
    res.json(lecturesData[batch].announcements);
  } else {
    res.json({}); // Return empty object if no announcements for the batch
  }
});

// GET announcements for a specific course in a batch
app.get('/learnlive/announcements/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch] && lecturesData[batch].announcements && lecturesData[batch].announcements[courseId]) {
    res.json(lecturesData[batch].announcements[courseId]);
  } else {
    res.json([]); // Return empty array if no announcements
  }
});

// CREATE/UPDATE lecture for a course in a batch
app.post('/learnlive/lectures/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const { lecture } = req.body;
  
  if (!lecture) {
    return res.status(400).json({ message: 'Lecture data is required' });
  }
  
  const lecturesData = readLecturesData();
  
  // Ensure the batch exists
  if (!lecturesData[batch]) {
    lecturesData[batch] = {
      lectures: {},
      announcements: {}
    };
  }
  
  // Ensure lectures object exists
  if (!lecturesData[batch].lectures) {
    lecturesData[batch].lectures = {};
  }
  
  // Ensure the course exists in the batch's lectures
  if (!lecturesData[batch].lectures[courseId]) {
    lecturesData[batch].lectures[courseId] = [];
  }
  
  // If lecture has an ID, it's an update, otherwise it's a new lecture
  if (lecture.id) {
    // Update existing lecture
    const lectureIndex = lecturesData[batch].lectures[courseId].findIndex(l => l.id === lecture.id);
    
    if (lectureIndex >= 0) {
      lecturesData[batch].lectures[courseId][lectureIndex] = lecture;
    } else {
      // Lecture not found, add it
      lecturesData[batch].lectures[courseId].push(lecture);
    }
  } else {
    // Add new lecture with a generated ID
    lecture.id = Date.now();
    lecturesData[batch].lectures[courseId].push(lecture);
  }
  
  if (writeLecturesData(lecturesData)) {
    res.status(200).json(lecture);
  } else {
    res.status(500).json({ message: 'Error saving lecture data' });
  }
});

// CREATE/UPDATE announcement for a course in a batch
app.post('/learnlive/announcements/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const { announcement } = req.body;
  
  if (!announcement) {
    return res.status(400).json({ message: 'Announcement data is required' });
  }
  
  const lecturesData = readLecturesData();
  
  // Ensure the batch exists
  if (!lecturesData[batch]) {
    lecturesData[batch] = {
      lectures: {},
      announcements: {}
    };
  }
  
  // Ensure announcements object exists
  if (!lecturesData[batch].announcements) {
    lecturesData[batch].announcements = {};
  }
  
  // Ensure the course exists in the batch's announcements
  if (!lecturesData[batch].announcements[courseId]) {
    lecturesData[batch].announcements[courseId] = [];
  }
  
  // If announcement has an ID, it's an update, otherwise it's a new announcement
  if (announcement.id) {
    // Update existing announcement
    const announcementIndex = lecturesData[batch].announcements[courseId].findIndex(a => a.id === announcement.id);
    
    if (announcementIndex >= 0) {
      lecturesData[batch].announcements[courseId][announcementIndex] = announcement;
    } else {
      // Announcement not found, add it
      lecturesData[batch].announcements[courseId].push(announcement);
    }
  } else {
    // Add new announcement with a generated ID
    announcement.id = Date.now();
    lecturesData[batch].announcements[courseId].push(announcement);
  }
  
  if (writeLecturesData(lecturesData)) {
    res.status(200).json(announcement);
  } else {
    res.status(500).json({ message: 'Error saving announcement data' });
  }
});

// DELETE lecture
app.delete('/learnlive/lectures/:batch/:courseId/:lectureId', (req, res) => {
  const { batch, courseId, lectureId } = req.params;
  const lecturesData = readLecturesData();
  
  if (
    lecturesData[batch] && 
    lecturesData[batch].lectures && 
    lecturesData[batch].lectures[courseId]
  ) {
    const lectureIdNum = parseInt(lectureId);
    lecturesData[batch].lectures[courseId] = lecturesData[batch].lectures[courseId].filter(
      lecture => lecture.id !== lectureIdNum
    );
    
    if (writeLecturesData(lecturesData)) {
      res.status(200).json({ message: 'Lecture deleted successfully' });
    } else {
      res.status(500).json({ message: 'Error deleting lecture' });
    }
  } else {
    res.status(404).json({ message: 'Batch, course or lecture not found' });
  }
});

// DELETE announcement
app.delete('/learnlive/announcements/:batch/:courseId/:announcementId', (req, res) => {
  const { batch, courseId, announcementId } = req.params;
  const lecturesData = readLecturesData();
  
  if (
    lecturesData[batch] && 
    lecturesData[batch].announcements && 
    lecturesData[batch].announcements[courseId]
  ) {
    const announcementIdNum = parseInt(announcementId);
    lecturesData[batch].announcements[courseId] = lecturesData[batch].announcements[courseId].filter(
      announcement => announcement.id !== announcementIdNum
    );
    
    if (writeLecturesData(lecturesData)) {
      res.status(200).json({ message: 'Announcement deleted successfully' });
    } else {
      res.status(500).json({ message: 'Error deleting announcement' });
    }
  } else {
    res.status(404).json({ message: 'Batch, course or announcement not found' });
  }
});

// PUT endpoint to update a course announcement by its ID
app.put('/learnlive/announcements/:batch/:courseId/:announcementId', (req, res) => {
  const { batch, courseId, announcementId } = req.params;
  const announcementData = req.body;
  const announcementIdNum = parseInt(announcementId);
  
  if (!announcementData) {
    return res.status(400).json({ message: 'Announcement data is required' });
  }
  
  const lecturesData = readLecturesData();
  let announcementFound = false;
  let updatedAnnouncement = null;
  
  if (
    lecturesData[batch] && 
    lecturesData[batch].announcements && 
    lecturesData[batch].announcements[courseId]
  ) {
    const announcementIndex = lecturesData[batch].announcements[courseId].findIndex(
      announcement => announcement.id === announcementIdNum
    );
    
    if (announcementIndex >= 0) {
      // Update the announcement with new data while preserving the ID
      lecturesData[batch].announcements[courseId][announcementIndex] = {
        ...lecturesData[batch].announcements[courseId][announcementIndex],
        ...announcementData,
        id: announcementIdNum // Ensure ID is preserved
      };
      updatedAnnouncement = lecturesData[batch].announcements[courseId][announcementIndex];
      announcementFound = true;
    }
  }
  
  if (announcementFound && updatedAnnouncement) {
    if (writeLecturesData(lecturesData)) {
      res.status(200).json(updatedAnnouncement); // Return the updated announcement object
    } else {
      res.status(500).json({ message: 'Error updating announcement data' });
    }
  } else {
    res.status(404).json({ message: 'Announcement not found' });
  }
});

// PUT endpoint to update a lecture by its ID
app.put('/learnlive/lectures/:lectureId', (req, res) => {
  const { lectureId } = req.params;
  const lectureData = req.body;
  const lectureIdNum = parseInt(lectureId);
  
  if (!lectureData) {
    return res.status(400).json({ message: 'Lecture data is required' });
  }
  
  const lecturesData = readLecturesData();
  let lectureFound = false;
  
  // Search through all batches and courses to find the lecture
  let updatedLecture = null;
  Object.keys(lecturesData).forEach(batch => {
    if (lecturesData[batch] && lecturesData[batch].lectures) {
      Object.keys(lecturesData[batch].lectures).forEach(courseId => {
        if (Array.isArray(lecturesData[batch].lectures[courseId])) {
          const lectureIndex = lecturesData[batch].lectures[courseId].findIndex(
            lecture => lecture.id === lectureIdNum
          );
          
          if (lectureIndex >= 0) {
            // Update the lecture with new data while preserving the ID
            lecturesData[batch].lectures[courseId][lectureIndex] = {
              ...lecturesData[batch].lectures[courseId][lectureIndex],
              ...lectureData,
              id: lectureIdNum // Ensure ID is preserved
            };
            updatedLecture = lecturesData[batch].lectures[courseId][lectureIndex];
            lectureFound = true;
          }
        }
      });
    }
  });
  
  if (lectureFound && updatedLecture) {
    if (writeLecturesData(lecturesData)) {
      res.status(200).json(updatedLecture); // Return the updated lecture object
    } else {
      res.status(500).json({ message: 'Error updating lecture data' });
    }
  } else {
    res.status(404).json({ message: 'Lecture not found' });
  }
});

// GET global announcements
app.get('/api/global-announcements', (req, res) => {
  const lecturesData = readLecturesData();
  res.json(lecturesData.globalAnnouncements || []);
});

// POST new global announcement
app.post('/api/global-announcements', (req, res) => {
  try {
    const lecturesData = readLecturesData();
    const newAnnouncement = req.body;
    
    // Initialize globalAnnouncements if it doesn't exist
    if (!lecturesData.globalAnnouncements) {
      lecturesData.globalAnnouncements = [];
    }
    
    // Add the new announcement
    lecturesData.globalAnnouncements.push(newAnnouncement);
    
    if (writeLecturesData(lecturesData)) {
      res.status(201).json(newAnnouncement);
    } else {
      res.status(500).json({ message: 'Failed to save announcement' });
    }
  } catch (error) {
    console.error('Error adding global announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT/UPDATE global announcement
app.put('/api/global-announcements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = req.body;
    const lecturesData = readLecturesData();
    
    if (!lecturesData.globalAnnouncements) {
      return res.status(404).json({ message: 'No global announcements found' });
    }
    
    const announcementIndex = lecturesData.globalAnnouncements.findIndex(
      announcement => announcement.id === parseInt(id)
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Update the announcement while preserving the original ID and date
    lecturesData.globalAnnouncements[announcementIndex] = {
      ...lecturesData.globalAnnouncements[announcementIndex],
      ...updatedAnnouncement,
      id: parseInt(id), // Preserve original ID
      updated_at: new Date().toISOString()
    };
    
    if (writeLecturesData(lecturesData)) {
      res.json(lecturesData.globalAnnouncements[announcementIndex]);
    } else {
      res.status(500).json({ message: 'Failed to update announcement' });
    }
  } catch (error) {
    console.error('Error updating global announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE global announcement
app.delete('/api/global-announcements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const lecturesData = readLecturesData();
    
    if (!lecturesData.globalAnnouncements) {
      return res.status(404).json({ message: 'No global announcements found' });
    }
    
    const announcementIndex = lecturesData.globalAnnouncements.findIndex(
      announcement => announcement.id === parseInt(id)
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    lecturesData.globalAnnouncements.splice(announcementIndex, 1);
    
    if (writeLecturesData(lecturesData)) {
      res.json({ message: 'Announcement deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete announcement' });
    }
    } catch (error) {
    console.error('Error deleting global announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== LIVE CLASS ANNOUNCEMENT ENDPOINTS =====

// GET live class announcement
app.get('/api/learnlive/live-class-announcement', (req, res) => {
  const lecturesData = readLecturesData();
  res.json(lecturesData.liveClassAnnouncement || null);
});

// POST/SET live class announcement (only one at a time)
app.post('/api/learnlive/live-class-announcement', (req, res) => {
  try {
    const lecturesData = readLecturesData();
    const newAnnouncement = {
      ...req.body,
      id: Date.now(),
      date: new Date().toISOString()
    };
    
    // Replace any existing live class announcement (only one allowed)
    lecturesData.liveClassAnnouncement = newAnnouncement;
    
    if (writeLecturesData(lecturesData)) {
      res.status(201).json(newAnnouncement);
    } else {
      res.status(500).json({ message: 'Failed to save live class announcement' });
    }
  } catch (error) {
    console.error('Error setting live class announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE/CLEAR live class announcement
app.delete('/api/learnlive/live-class-announcement', (req, res) => {
  try {
    const lecturesData = readLecturesData();
    
    // Clear the live class announcement
    lecturesData.liveClassAnnouncement = null;
    
    if (writeLecturesData(lecturesData)) {
      res.json({ message: 'Live class announcement cleared successfully' });
    } else {
      res.status(500).json({ message: 'Failed to clear live class announcement' });
    }
  } catch (error) {
    console.error('Error clearing live class announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== COURSES ENDPOINTS =====

// GET all courses
app.get('/api/courses', (req, res) => {
  const coursesData = readCoursesData();
  res.json(coursesData.courses || []);
});

// GET a single course by ID
app.get('/api/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const coursesData = readCoursesData();
    const course = coursesData.courses.find(c => c.id === parseInt(id));
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new course
app.post('/api/courses', (req, res) => {
  try {
    const coursesData = readCoursesData();
    const newCourse = {
      ...req.body,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!coursesData.courses) {
      coursesData.courses = [];
    }
    
    coursesData.courses.push(newCourse);
    
    if (writeCoursesData(coursesData)) {
      res.status(201).json(newCourse);
    } else {
      res.status(500).json({ message: 'Failed to save course' });
    }
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update a course
app.put('/api/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const coursesData = readCoursesData();
    const courseIndex = coursesData.courses.findIndex(c => c.id === parseInt(id));
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    coursesData.courses[courseIndex] = {
      ...coursesData.courses[courseIndex],
      ...req.body,
      id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    if (writeCoursesData(coursesData)) {
      res.json(coursesData.courses[courseIndex]);
    } else {
      res.status(500).json({ message: 'Failed to update course' });
    }
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a course
app.delete('/api/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const coursesData = readCoursesData();
    const courseIndex = coursesData.courses.findIndex(c => c.id === parseInt(id));
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    coursesData.courses.splice(courseIndex, 1);
    
    if (writeCoursesData(coursesData)) {
      res.json({ message: 'Course deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete course' });
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== COURSE OVERVIEWS ENDPOINTS =====

// GET course overview by course ID
app.get('/api/courses/:courseId/overview', (req, res) => {
  try {
    const { courseId } = req.params;
    const overviewsData = readCourseOverviewsData();
    const overview = overviewsData.overviews[courseId];
    
    if (!overview) {
      return res.json({ content: '' });
    }
    
    res.json(overview);
  } catch (error) {
    console.error('Error fetching course overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST/PUT course overview by course ID
app.post('/api/courses/:courseId/overview', (req, res) => {
  try {
    const { courseId } = req.params;
    const { content } = req.body;
    
    const overviewsData = readCourseOverviewsData();
    
    overviewsData.overviews[courseId] = {
      content,
      updatedAt: new Date().toISOString()
    };
    
    if (writeCourseOverviewsData(overviewsData)) {
      res.json({ message: 'Course overview saved successfully', overview: overviewsData.overviews[courseId] });
    } else {
      res.status(500).json({ message: 'Failed to save course overview' });
    }
  } catch (error) {
    console.error('Error saving course overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== COURSE ANNOUNCEMENTS ENDPOINTS =====

// GET course announcements by course ID
app.get('/api/courses/:courseId/announcements', (req, res) => {
  try {
    const { courseId } = req.params;
    const announcementsData = readCourseAnnouncementsData();
    const announcements = announcementsData.announcements[courseId] || [];
    
    // Sort by creation date (newest first)
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching course announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new course announcement
app.post('/api/courses/:courseId/announcements', (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    
    const announcementsData = readCourseAnnouncementsData();
    
    if (!announcementsData.announcements[courseId]) {
      announcementsData.announcements[courseId] = [];
    }
    
    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    announcementsData.announcements[courseId].push(newAnnouncement);
    
    if (writeCourseAnnouncementsData(announcementsData)) {
      res.json({ message: 'Announcement created successfully', announcement: newAnnouncement });
    } else {
      res.status(500).json({ message: 'Failed to create announcement' });
    }
  } catch (error) {
    console.error('Error creating course announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update course announcement
app.put('/api/courses/:courseId/announcements/:announcementId', (req, res) => {
  try {
    const { courseId, announcementId } = req.params;
    const { title, content } = req.body;
    
    const announcementsData = readCourseAnnouncementsData();
    
    if (!announcementsData.announcements[courseId]) {
      return res.status(404).json({ message: 'Course announcements not found' });
    }
    
    const announcementIndex = announcementsData.announcements[courseId].findIndex(
      a => a.id === parseInt(announcementId)
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcementsData.announcements[courseId][announcementIndex] = {
      ...announcementsData.announcements[courseId][announcementIndex],
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    
    if (writeCourseAnnouncementsData(announcementsData)) {
      res.json({ 
        message: 'Announcement updated successfully', 
        announcement: announcementsData.announcements[courseId][announcementIndex] 
      });
    } else {
      res.status(500).json({ message: 'Failed to update announcement' });
    }
  } catch (error) {
    console.error('Error updating course announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE course announcement
app.delete('/api/courses/:courseId/announcements/:announcementId', (req, res) => {
  try {
    const { courseId, announcementId } = req.params;
    
    const announcementsData = readCourseAnnouncementsData();
    
    if (!announcementsData.announcements[courseId]) {
      return res.status(404).json({ message: 'Course announcements not found' });
    }
    
    const announcementIndex = announcementsData.announcements[courseId].findIndex(
      a => a.id === parseInt(announcementId)
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcementsData.announcements[courseId].splice(announcementIndex, 1);
    
    if (writeCourseAnnouncementsData(announcementsData)) {
      res.json({ message: 'Announcement deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete announcement' });
    }
  } catch (error) {
    console.error('Error deleting course announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all groups
app.get('/api/groups', (req, res) => {
  try {
    const groupsData = readGroupsData();
    res.json(groupsData.groups);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new group
app.post('/api/groups', (req, res) => {
  try {
    const { name, link, description, platform, createdBy } = req.body;
    const groupsData = readGroupsData();
    
    // Generate new ID
    const newId = groupsData.groups.length > 0 
      ? Math.max(...groupsData.groups.map(g => g.id)) + 1 
      : 1;
    
    const newGroup = {
      id: newId,
      name,
      link,
      description: description || '',
      platform: platform || 'Other',
      memberCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: createdBy || 'Admin'
    };
    
    groupsData.groups.push(newGroup);
    
    if (writeGroupsData(groupsData)) {
      res.status(201).json(newGroup);
    } else {
      res.status(500).json({ message: 'Failed to create group' });
    }
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE a group
app.put('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, description, platform, memberCount, isActive, updatedBy } = req.body;
    const groupsData = readGroupsData();
    
    const groupIndex = groupsData.groups.findIndex(g => g.id === parseInt(id));
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Update the group
    groupsData.groups[groupIndex] = {
      ...groupsData.groups[groupIndex],
      name: name || groupsData.groups[groupIndex].name,
      link: link || groupsData.groups[groupIndex].link,
      description: description !== undefined ? description : groupsData.groups[groupIndex].description,
      platform: platform || groupsData.groups[groupIndex].platform,
      memberCount: memberCount !== undefined ? memberCount : groupsData.groups[groupIndex].memberCount,
      isActive: isActive !== undefined ? isActive : groupsData.groups[groupIndex].isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'Admin'
    };
    
    if (writeGroupsData(groupsData)) {
      res.json(groupsData.groups[groupIndex]);
    } else {
      res.status(500).json({ message: 'Failed to update group' });
    }
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a group
app.delete('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const groupsData = readGroupsData();
    const groupIndex = groupsData.groups.findIndex(g => g.id === parseInt(id));
    
    if (groupIndex === -1) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    groupsData.groups.splice(groupIndex, 1);
    
    if (writeGroupsData(groupsData)) {
      res.json({ message: 'Group deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete group' });
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET dashboard videos
app.get('/api/dashboard-videos', (req, res) => {
  try {
    const miscData = readMiscData();
    res.json(miscData.dashboardVideo);
  } catch (error) {
    console.error('Error getting dashboard videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE dashboard video (admin only)
app.put('/api/dashboard-videos', (req, res) => {
  try {
    const { title, description, videoUrl, videoType, isActive, updatedBy } = req.body;
    
    const miscData = readMiscData();
    
    // Update the video configuration
    miscData.dashboardVideo = {
      title,
      description,
      videoUrl,
      videoType, // 'youtube', 'embed', or 'direct'
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    
    if (writeMiscData(miscData)) {
      res.json(miscData.dashboardVideo);
    } else {
      res.status(500).json({ message: 'Failed to update video configuration' });
    }
  } catch (error) {
    console.error('Error updating dashboard video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET dashboard statistics
app.get('/api/dashboard-stats', (req, res) => {
  try {
    const lecturesData = readLecturesData();
    const coursesData = readCoursesData();
    
    // Count total courses
    const totalCourses = coursesData.courses.length;
    
    // Count currently live classes across all batches
    let liveClassesCount = 0;
    
    // Iterate through all batches
    Object.keys(lecturesData).forEach(batchKey => {
      if (batchKey !== 'globalAnnouncements' && batchKey !== 'liveClassAnnouncement' && lecturesData[batchKey].lectures) {
        const batchLectures = lecturesData[batchKey].lectures;
        
        // Iterate through courses in batch
        Object.keys(batchLectures).forEach(courseId => {
          const courseLectures = batchLectures[courseId];
          if (Array.isArray(courseLectures)) {
            // Count lectures that are currently live
            liveClassesCount += courseLectures.filter(lecture => lecture.currentlyLive === true).length;
          }
        });
      }
    });
    
    res.json({
      totalCourses,
      liveClassesCount,
      totalBatches: Object.keys(lecturesData).filter(key => 
        key !== 'globalAnnouncements' && key !== 'liveClassAnnouncement'
      ).length
    });
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server

// Recorded Lectures Endpoints
const recordedLecturesFilePath = path.join(__dirname, 'data', 'recorded-lectures.json');

// Helper function to read recorded lectures data
const readRecordedLecturesData = () => {
  try {
    const data = fs.readFileSync(recordedLecturesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading recorded lectures data:', err);
    return {};
  }
};

// Helper function to write recorded lectures data
const writeRecordedLecturesData = (data) => {
  try {
    fs.writeFileSync(recordedLecturesFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing recorded lectures data:', err);
    return false;
  }
};

// Get recorded lectures for a course
app.get('/api/recorded-lectures/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const recordedLecturesData = readRecordedLecturesData();
    const courseLectures = recordedLecturesData[courseId] || [];
    res.json(courseLectures);
  } catch (error) {
    console.error('Error fetching recorded lectures:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new recorded lecture
app.post('/api/recorded-lectures', (req, res) => {
  try {
    const lectureData = req.body;
    const { course_id } = lectureData;
    
    if (!course_id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    
    const recordedLecturesData = readRecordedLecturesData();
    
    // Initialize course lectures array if it doesn't exist
    if (!recordedLecturesData[course_id]) {
      recordedLecturesData[course_id] = [];
    }
    
    // Generate unique ID
    const newId = Date.now();
    const newLecture = {
      ...lectureData,
      id: newId,
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0
    };
    
    recordedLecturesData[course_id].push(newLecture);
    
    if (writeRecordedLecturesData(recordedLecturesData)) {
      res.status(201).json({ id: newId, ...newLecture });
    } else {
      res.status(500).json({ error: 'Failed to save recorded lecture' });
    }
  } catch (error) {
    console.error('Error creating recorded lecture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recorded lecture
app.put('/api/recorded-lectures/:lectureId', (req, res) => {
  try {
    const { lectureId } = req.params;
    const lectureData = req.body;
    const recordedLecturesData = readRecordedLecturesData();
    
    let updated = false;
    
    // Find and update the lecture in any course
    for (const courseId in recordedLecturesData) {
      const lectures = recordedLecturesData[courseId];
      const lectureIndex = lectures.findIndex(l => l.id === parseInt(lectureId));
      
      if (lectureIndex !== -1) {
        recordedLecturesData[courseId][lectureIndex] = {
          ...lectures[lectureIndex],
          ...lectureData,
          id: parseInt(lectureId)
        };
        updated = true;
        break;
      }
    }
    
    if (updated && writeRecordedLecturesData(recordedLecturesData)) {
      res.json({ message: 'Recorded lecture updated successfully' });
    } else {
      res.status(404).json({ error: 'Recorded lecture not found' });
    }
  } catch (error) {
    console.error('Error updating recorded lecture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recorded lecture
app.delete('/api/recorded-lectures/:lectureId', (req, res) => {
  try {
    const { lectureId } = req.params;
    const recordedLecturesData = readRecordedLecturesData();
    
    let deleted = false;
    
    // Find and delete the lecture from any course
    for (const courseId in recordedLecturesData) {
      const lectures = recordedLecturesData[courseId];
      const lectureIndex = lectures.findIndex(l => l.id === parseInt(lectureId));
      
      if (lectureIndex !== -1) {
        recordedLecturesData[courseId].splice(lectureIndex, 1);
        deleted = true;
        break;
      }
    }
    
    if (deleted && writeRecordedLecturesData(recordedLecturesData)) {
      res.json({ message: 'Recorded lecture deleted successfully' });
    } else {
      res.status(404).json({ error: 'Recorded lecture not found' });
    }
  } catch (error) {
    console.error('Error deleting recorded lecture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// The "catch all" handler: for any request that doesn't match API routes above, 
// send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving frontend from ${path.join(__dirname, '..', 'dist')}`);
});
