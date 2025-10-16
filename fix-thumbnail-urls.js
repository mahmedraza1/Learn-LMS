import fs from 'fs';

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

// Read lectures.json
const lecturesData = JSON.parse(fs.readFileSync('server/data/lectures.json', 'utf-8'));

let updatedCount = 0;

// Process each batch
for (const batchKey of ['Batch A', 'Batch B']) {
  if (lecturesData[batchKey] && lecturesData[batchKey].lectures) {
    // Process each course
    for (const courseId in lecturesData[batchKey].lectures) {
      const lectures = lecturesData[batchKey].lectures[courseId];
      
      // Process each lecture
      for (let i = 0; i < lectures.length; i++) {
        const lecture = lectures[i];
        
        if (lecture.youtube_url) {
          const generatedThumbnail = generateYouTubeThumbnailUrl(lecture.youtube_url);
          
          // Only update if:
          // 1. No thumbnail_url exists, OR
          // 2. thumbnail_url is the same as youtube_url (old format), OR
          // 3. thumbnail_url doesn't match the proper format
          if (!lecture.thumbnail_url || 
              lecture.thumbnail_url === lecture.youtube_url ||
              !lecture.thumbnail_url.includes('img.youtube.com')) {
            
            lecture.thumbnail_url = generatedThumbnail;
            updatedCount++;
            console.log(`Updated ${batchKey} - Course ${courseId} - Lecture: ${lecture.title}`);
          }
        }
      }
    }
  }
}

// Write back to file
fs.writeFileSync('server/data/lectures.json', JSON.stringify(lecturesData, null, 2));

console.log(`\n✅ Successfully updated ${updatedCount} lecture thumbnails!`);
console.log('All thumbnails now use format: https://img.youtube.com/vi/{videoID}/maxresdefault.jpg');
