import React from 'react';
import { FaPlay, FaEdit, FaTrash, FaYoutube, FaVideo, FaCalendarAlt } from 'react-icons/fa';

const RecordedLectureCard = ({ 
  lecture, 
  isAdmin = false, 
  onPlay,
  onEdit,
  onDelete 
}) => {
  // Detect video type
  const getVideoType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'raw';
    }
    return 'unknown';
  };

  // Get YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    
    try {
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        const parts = url.split('embed/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      if (videoId) {
        // Use maxresdefault for better quality, fallback to sddefault
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch (error) {
      console.error('Error extracting YouTube thumbnail:', error);
    }
    
    return null;
  };

  // Extract YouTube video ID for thumbnail generation
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    try {
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        const parts = url.split('embed/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      return videoId;
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
      return null;
    }
  };

  const videoType = getVideoType(lecture.videoUrl || lecture.video_url);
  const youtubeVideoId = getYouTubeVideoId(lecture.videoUrl || lecture.video_url);
  
  // Get thumbnail URL with priority: custom thumbnail > auto-generated YouTube thumbnail
  const getThumbnailUrl = () => {
    // First priority: custom thumbnail URL
    if (lecture.thumbnailUrl || lecture.thumbnail) {
      const url = lecture.thumbnailUrl || lecture.thumbnail;
      // Ensure the URL is properly formatted
      if (url && url.trim() !== '') {
        return url.trim();
      }
    }
    
    // Second priority: auto-generate from YouTube
    if (videoType === 'youtube' && youtubeVideoId) {
      // Use sddefault as it's more reliable than maxresdefault
      const generatedUrl = `https://img.youtube.com/vi/${youtubeVideoId}/sddefault.jpg`;
      return generatedUrl;
    }
    
    return null;
  };
  
  const thumbnailUrl = getThumbnailUrl();

  const handlePlay = () => {
    if (onPlay && (lecture.videoUrl || lecture.video_url)) {
      onPlay(lecture);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(lecture);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this recorded lecture?')) {
      onDelete(lecture);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl}
              alt={lecture.lectureName || lecture.title || `Lecture ${lecture.lecture_number}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Thumbnail failed to load:', e.target.src);
                // If maxresdefault fails for YouTube, try sddefault
                if (videoType === 'youtube' && youtubeVideoId && e.target.src.includes('maxresdefault')) {
                  e.target.src = `https://img.youtube.com/vi/${youtubeVideoId}/sddefault.jpg`;
                } else if (videoType === 'youtube' && youtubeVideoId && e.target.src.includes('sddefault')) {
                  // If sddefault also fails, try mqdefault
                  e.target.src = `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`;
                } else {
                  // Hide image and show fallback
                  e.target.style.display = 'none';
                  const fallback = e.target.parentNode.querySelector('.thumbnail-fallback');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }
              }}
            />
            {/* Fallback when thumbnail fails to load */}
            <div 
              className="thumbnail-fallback absolute inset-0 flex items-center justify-center w-full h-full bg-gray-200"
              style={{ display: 'none' }}
            >
              {videoType === 'youtube' ? (
                <FaYoutube className="text-4xl text-red-500" />
              ) : (
                <FaVideo className="text-4xl text-gray-400" />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            {videoType === 'youtube' ? (
              <FaYoutube className="text-4xl text-red-500" />
            ) : (
              <FaVideo className="text-4xl text-gray-400" />
            )}
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-all cursor-pointer group"
             onClick={handlePlay}>
          <div className="bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full p-3 transform group-hover:scale-110 transition-all">
            <FaPlay className="text-emerald-600 text-xl ml-1" />
          </div>
        </div>

        {/* Video type indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
          {videoType === 'youtube' ? (
            <>
              <FaYoutube className="mr-1" />
              YouTube
            </>
          ) : videoType === 'raw' ? (
            <>
              <FaVideo className="mr-1" />
              Video
            </>
          ) : (
            'Unknown'
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {lecture.lectureName || lecture.title || `Lecture ${lecture.lecture_number}`}
        </h3>

        {/* Lecture Number */}
        {lecture.lecture_number && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
           <FaCalendarAlt className="mr-1 text-gray-500" />  
            <span className="font-medium">Lecture {lecture.lecture_number}</span>
          </div>
        )}

        {/* Description */}
        {lecture.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {lecture.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-center items-center">
          {isAdmin ? (
            <div className="flex justify-between items-center w-full">
              <button
                onClick={handlePlay}
                disabled={!lecture.videoUrl && !lecture.video_url}
                className="flex items-center px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FaPlay className="mr-2" />
                Watch
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm"
                >
                  <FaTrash className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePlay}
              disabled={!lecture.videoUrl && !lecture.video_url}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <FaPlay className="mr-2" />
              Watch Lecture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordedLectureCard;