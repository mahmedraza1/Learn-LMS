import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Helper function to extract YouTube video ID and generate thumbnail URL
function generateYouTubeThumbnailUrl(youtubeUrl) {
  if (!youtubeUrl) return '';
  
  try {
    let videoId = null;
    
    if (youtubeUrl.includes('youtu.be/')) {
      const parts = youtubeUrl.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0].split('&')[0];
      }
    } else if (youtubeUrl.includes('youtube.com/watch')) {
      const url = new URL(youtubeUrl);
      videoId = url.searchParams.get('v');
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
      const parts = youtubeUrl.split('embed/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0].split('&')[0];
      }
    } else if (youtubeUrl.includes('youtube.com/live/')) {
      const parts = youtubeUrl.split('live/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0].split('&')[0];
      }
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (err) {
    console.error("Invalid YouTube URL", err);
  }
  
  return '';
}

// Read the CSV file
const csvContent = fs.readFileSync('Lecture json.csv', 'utf-8');
const records = parse(csvContent, {
  skip_empty_lines: false,
  relax_column_count: true
});

// Read existing lectures.json
const lecturesData = JSON.parse(fs.readFileSync('server/data/lectures.json', 'utf-8'));

// Parse course groups from row 2 (index 1)
const courseGroups = records[1].slice(1, 9).map(group => {
  if (!group) return [];
  const match = group.match(/\[([^\]]+)\]/);
  return match ? match[1].split(',').map(id => parseInt(id.trim())) : [];
});

console.log('Course Groups:', courseGroups);

// Function to convert 12-hour time to 24-hour format
function convertTo24Hour(timeStr) {
  if (!timeStr || timeStr.trim() === '') return null;
  
  // Extract just the start time from "01:00PM to 02:00PM" format
  const match = timeStr.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Function to convert date from MM-DD-YY to YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const [month, day, year] = dateStr.split('-');
  const fullYear = `20${year}`;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Create a map to track which course needs which lecture index
const courseScheduleMap = {};

// Initialize course schedule map
for (let batchKey of ['Batch A', 'Batch B']) {
  courseScheduleMap[batchKey] = {};
  const startId = batchKey === 'Batch A' ? 1 : 101;
  const endId = batchKey === 'Batch A' ? 15 : 115;
  
  for (let courseId = startId; courseId <= endId; courseId++) {
    courseScheduleMap[batchKey][courseId] = 0; // Track current lecture index for each course
  }
}

// Get existing lectures for reference (titles and URLs)
const existingLectures = {};
for (let batchKey of ['Batch A', 'Batch B']) {
  existingLectures[batchKey] = {};
  if (lecturesData[batchKey] && lecturesData[batchKey].lectures) {
    for (let courseId in lecturesData[batchKey].lectures) {
      existingLectures[batchKey][courseId] = lecturesData[batchKey].lectures[courseId];
    }
  }
}

// Create new lecture structure
const newLectures = {
  'Batch A': { lectures: {} },
  'Batch B': { lectures: {} }
};

// Initialize empty arrays for all courses
for (let batchKey of ['Batch A', 'Batch B']) {
  const startId = batchKey === 'Batch A' ? 1 : 15;
  const endId = batchKey === 'Batch A' ? 15 : 115;
  
  for (let courseId = startId; courseId <= endId; courseId++) {
    newLectures[batchKey].lectures[courseId.toString()] = [];
  }
}

// Process each date row (starting from row 3, index 2)
for (let i = 2; i < records.length; i++) {
  const row = records[i];
  const dateStr = row[0];
  const day = row[9];
  
  if (!dateStr || dateStr.trim() === '') continue;
  
  const date = convertDate(dateStr);
  if (!date) continue;
  
  console.log(`\nProcessing date: ${dateStr} -> ${date} (${day})`);
  
  // Check each column for time slots
  for (let colIndex = 1; colIndex <= 8; colIndex++) {
    const timeSlot = row[colIndex];
    
    if (timeSlot && timeSlot.trim() !== '') {
      const time = convertTo24Hour(timeSlot);
      if (!time) continue;
      
      const courses = courseGroups[colIndex - 1];
      const batchKey = colIndex % 2 === 1 ? 'Batch A' : 'Batch B';
      
      console.log(`  Column ${colIndex}: ${timeSlot} -> ${time} for courses ${courses.join(',')} (${batchKey})`);
      
      // For each course in this group, add/update the lecture
      for (let courseId of courses) {
        const lectureIndex = courseScheduleMap[batchKey][courseId];
        const existingLecturesForCourse = existingLectures[batchKey][courseId.toString()] || [];
        
        if (lectureIndex < existingLecturesForCourse.length) {
          const existingLecture = existingLecturesForCourse[lectureIndex];
          
          // Create new lecture entry with updated date/time
          const newLecture = {
            title: existingLecture.title,
            youtube_url: existingLecture.youtube_url,
            thumbnail_url: existingLecture.thumbnail_url || generateYouTubeThumbnailUrl(existingLecture.youtube_url),
            date: date,
            time: time,
            day: day,
            course_id: courseId,
            batch: batchKey,
            delivered: false,
            currentlyLive: false,
            id: Date.now() + Math.floor(Math.random() * 1000) // Generate unique integer ID
          };
          
          newLectures[batchKey].lectures[courseId.toString()].push(newLecture);
          courseScheduleMap[batchKey][courseId]++;
          
          console.log(`    Added lecture ${lectureIndex + 1} for course ${courseId}: ${existingLecture.title}`);
        }
      }
    }
  }
}

// Preserve the global announcements and liveClassAnnouncement
const updatedData = {
  liveClassAnnouncement: lecturesData.liveClassAnnouncement,
  globalAnnouncements: lecturesData.globalAnnouncements,
  'Batch A': newLectures['Batch A'],
  'Batch B': newLectures['Batch B']
};

// Write to file
fs.writeFileSync('server/data/lectures.json', JSON.stringify(updatedData, null, 2));

console.log('\n✅ lectures.json updated successfully!');

// Print summary
console.log('\n📊 Summary:');
for (let batchKey of ['Batch A', 'Batch B']) {
  console.log(`\n${batchKey}:`);
  for (let courseId in newLectures[batchKey].lectures) {
    const count = newLectures[batchKey].lectures[courseId].length;
    if (count > 0) {
      console.log(`  Course ${courseId}: ${count} lectures`);
    }
  }
}
