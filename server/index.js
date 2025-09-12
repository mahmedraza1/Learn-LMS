const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

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
    return { "Batch A": {}, "Batch B": {} };
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
app.get('/api/lectures', (req, res) => {
  const lecturesData = readLecturesData();
  res.json(lecturesData);
});

// GET lectures for a specific batch
app.get('/api/lectures/:batch', (req, res) => {
  const { batch } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch]) {
    res.json(lecturesData[batch]);
  } else {
    res.status(404).json({ message: `Batch "${batch}" not found` });
  }
});

// GET lectures for a specific course in a batch
app.get('/api/lectures/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const lecturesData = readLecturesData();
  
  if (lecturesData[batch] && lecturesData[batch][courseId]) {
    res.json(lecturesData[batch][courseId]);
  } else {
    res.status(404).json({ message: `Course ${courseId} in batch "${batch}" not found` });
  }
});

// CREATE/UPDATE lecture for a course in a batch
app.post('/api/lectures/:batch/:courseId', (req, res) => {
  const { batch, courseId } = req.params;
  const { lecture } = req.body;
  
  if (!lecture) {
    return res.status(400).json({ message: 'Lecture data is required' });
  }
  
  const lecturesData = readLecturesData();
  
  // Ensure the batch exists
  if (!lecturesData[batch]) {
    lecturesData[batch] = {};
  }
  
  // Ensure the course exists in the batch
  if (!lecturesData[batch][courseId]) {
    lecturesData[batch][courseId] = [];
  }
  
  // If lecture has an ID, it's an update, otherwise it's a new lecture
  if (lecture.id) {
    // Update existing lecture
    const lectureIndex = lecturesData[batch][courseId].findIndex(l => l.id === lecture.id);
    
    if (lectureIndex >= 0) {
      lecturesData[batch][courseId][lectureIndex] = lecture;
    } else {
      // Lecture not found, add it
      lecturesData[batch][courseId].push(lecture);
    }
  } else {
    // Add new lecture with a generated ID
    lecture.id = Date.now();
    lecturesData[batch][courseId].push(lecture);
  }
  
  if (writeLecturesData(lecturesData)) {
    res.status(200).json(lecture);
  } else {
    res.status(500).json({ message: 'Error saving lecture data' });
  }
});

// DELETE lecture
app.delete('/api/lectures/:batch/:courseId/:lectureId', (req, res) => {
  const { batch, courseId, lectureId } = req.params;
  const lecturesData = readLecturesData();
  
  if (
    lecturesData[batch] && 
    lecturesData[batch][courseId]
  ) {
    const lectureIdNum = parseInt(lectureId);
    lecturesData[batch][courseId] = lecturesData[batch][courseId].filter(
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
