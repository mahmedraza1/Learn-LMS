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

// Path to data file
const dataFilePath = path.join(__dirname, 'data', 'lectures.json');

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
            lectureFound = true;
          }
        }
      });
    }
  });
  
  if (lectureFound) {
    if (writeLecturesData(lecturesData)) {
      res.status(200).json({ message: 'Lecture updated successfully' });
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
