import React from "react";
import { useLecture } from "../contexts/LectureContext";
import { FaYoutube, FaEdit, FaTrash, FaClock, FaPlay, FaCheck, FaCalendarAlt, FaClock as FaClockCircle, FaStop } from "react-icons/fa";

const LectureCard = ({ 
  lecture, 
  lectureNumber, 
  isEditable = false, 
  isAdmin = false,
  onEdit,
  onDelete,
  onAttend,
  onStartLecture,
  onMarkDelivered,
  scheduleDate
}) => {
  const { isToday } = useLecture();
  const isLectureToday = isToday(scheduleDate);
  
  // Format date to display in card
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get day of week - use lecture.day if available, otherwise calculate from date
  const getDayOfWeek = (date) => {
    // First check if the lecture object has a day property
    if (lecture && lecture.day) {
      return lecture.day;
    }
    
    // Fall back to calculating from date
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };
  
  // Format time from 24h to 12h with AM/PM
  const formatTimeToAmPm = (time24h) => {
    if (!time24h) return '';
    
    try {
      // Parse the time in 24-hour format (HH:MM)
      const [hours24, minutes] = time24h.split(':').map(num => parseInt(num, 10));
      
      // Convert to 12-hour format
      let hours12 = hours24 % 12;
      if (hours12 === 0) hours12 = 12; // Handle 00:00 (midnight) and 12:00 (noon)
      
      // Determine AM or PM
      const period = hours24 < 12 ? 'AM' : 'PM';
      
      // Format as HH:MM AM/PM
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (err) {
      console.error("Invalid time format", err);
      return time24h; // Return original if parsing fails
    }
  };

  // Get YouTube thumbnail URL if available
  const getThumbnailUrl = () => {
    // If lecture has a youtube_id property, use it directly
    if (lecture?.youtube_id) {
      return `https://img.youtube.com/vi/${lecture.youtube_id}/sddefault.jpg`;
    }
    
    // Otherwise, try to extract it from the URL
    if (lecture?.youtube_url) {
      try {
        // Handle different YouTube URL formats
        let videoId = null;
        
        if (lecture.youtube_url.includes('youtu.be/')) {
          // Short URL format: https://youtu.be/VIDEO_ID
          const parts = lecture.youtube_url.split('youtu.be/');
          if (parts.length > 1) {
            videoId = parts[1].split('?')[0].split('&')[0];
          }
        } else if (lecture.youtube_url.includes('youtube.com/watch')) {
          // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
          const url = new URL(lecture.youtube_url);
          videoId = url.searchParams.get('v');
        } else if (lecture.youtube_url.includes('youtube.com/embed/')) {
          // Embed URL: https://www.youtube.com/embed/VIDEO_ID
          const parts = lecture.youtube_url.split('embed/');
          if (parts.length > 1) {
            videoId = parts[1].split('?')[0].split('&')[0];
          }
        }
        
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
        }
      } catch (err) {
        console.error("Invalid YouTube URL", err);
      }
    }
    
    return null;
  };

  // Determine lecture status
  const isDelivered = lecture?.delivered;
  const isCurrentlyLive = lecture?.currentlyLive;

  // Determine if this is today's lecture
  const isTodayLecture = isLectureToday;
  
  // Apply special styling for today's lecture and delivered lectures
  const cardClassName = `relative rounded-lg overflow-hidden shadow ${
    isCurrentlyLive
      ? 'bg-white border-2 border-red-500 transform scale-105 z-20 shadow-lg shadow-red-600/40 animate-pulse' // Currently live lecture - red with pulse
      : isTodayLecture 
        ? isDelivered
          ? 'bg-white border-2 border-green-400 transform scale-105 z-10 shadow-lg shadow-green-600/30' // Today's delivered lecture
          : 'bg-white border-2 border-blue-400 transform scale-105 z-10 shadow-lg shadow-blue-600/30' // Today's available but not delivered lecture
        : isDelivered
          ? 'bg-white border border-green-200 shadow-sm' // Delivered lecture
        : 'bg-white border border-amber-200 shadow-sm' // Upcoming lecture
  }`;

  return (
    <div className={cardClassName}>
      {/* Thumbnail or placeholder */}
      <div className="relative h-40 bg-gray-100">
        {getThumbnailUrl() ? (
          <img 
            src={getThumbnailUrl()} 
            alt={`Lecture ${lectureNumber} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <FaYoutube className="text-4xl text-gray-400" />
          </div>
        )}
        
        {/* Date badge */}
        <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <FaClock className="text-gray-500" />
              <span>{formatDate(scheduleDate)}</span>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-600 font-medium mt-0.5">
              <FaCalendarAlt className="mr-1 text-gray-500 text-[10px]" />
              {getDayOfWeek(scheduleDate)}
            </div>
          </div>
        </div>
        
        {/* Status Badge at top-right corner */}
        <div className={`absolute top-2 right-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
          lecture?.delivered 
            ? 'bg-green-100 text-green-800' 
            : isTodayLecture 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
        }`}>
          {lecture?.delivered ? (
            <span className="flex items-center">
              <FaCheck className="mr-1" />
              Delivered
            </span>
          ) : isTodayLecture ? (
            <span className="flex items-center">
              <FaClock className="mr-1" />
              Available
            </span>
          ) : (
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              Upcoming Soon
            </span>
          )}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold flex items-center">
          {lecture?.title || `Lecture ${lectureNumber}`}
          {lecture?.delivered && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center">
              <FaCheck className="mr-1" />
              Delivered
            </span>
          )}
        </h3>
        
        {/* Info section with organized details */}
        <div className="mb-3 grid grid-cols-2 gap-y-1">
          {/* Lecture number display */}
          <div className="flex items-center text-xs text-gray-600">
            <FaCalendarAlt className="mr-1 text-gray-500" />
            <span>Lecture: {lecture?.lecture_number || lectureNumber}</span>
          </div>
          
          {/* Time badge if available */}
          {lecture?.time && (
            <div className="flex items-center text-xs text-gray-600">
              <FaClockCircle className="mr-1 text-gray-500" />
              <span>{formatTimeToAmPm(lecture.time)}</span>
            </div>
          )}
          
          {/* Removed status badge above attend button */}
        </div>
        
        {/* Actions */}
        <div className="mt-4 flex justify-between">
          {isEditable ? (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => onEdit(lecture)}
                className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium ${
                  !lecture?.youtube_url 
                    ? 'bg-[#0d7c66] text-white hover:bg-[#0a6a58]'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <FaEdit className="mr-1" /> {!lecture?.youtube_url ? 'Add Lecture' : 'Edit'}
              </button>
              {lecture?.youtube_url && (
                <>
                  <button 
                    onClick={() => onAttend(lecture)}
                    className="flex items-center rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100"
                  >
                    <FaPlay className="mr-1" /> Preview
                  </button>
                  <button 
                    onClick={() => onDelete(lecture)}
                    className="flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                  {isAdmin && (
                    <>
                      {/* Debug info */}
                      {console.log("LectureCard debug:", {
                        lectureTitle: lecture.title,
                        isDelivered,
                        isCurrentlyLive,
                        delivered: lecture?.delivered,
                        currentlyLive: lecture?.currentlyLive
                      })}
                      
                      {/* Status indicator */}
                      {isCurrentlyLive && (
                        <div className="flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                          LIVE NOW
                        </div>
                      )}
                      
                      {/* Lecture control buttons */}
                      {!isDelivered && !isCurrentlyLive && (
                        <button 
                          onClick={() => {
                            console.log("Start Lecture clicked for:", lecture);
                            onStartLecture && onStartLecture(lecture);
                          }}
                          className="flex items-center rounded-md px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <FaPlay className="mr-1" /> Start Lecture
                        </button>
                      )}
                      
                      {/* Mark Delivered button - show when live or when delivered (to toggle) */}
                      {(isCurrentlyLive || isDelivered) && (
                        <button 
                          onClick={() => onMarkDelivered && onMarkDelivered(lecture)}
                          className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            isDelivered 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <FaCheck className="mr-1" /> 
                          {isDelivered ? 'Delivered' : 'Mark Delivered'}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex w-full justify-center">
              {isCurrentlyLive ? (
                <button
                  onClick={() => onAttend(lecture)}
                  className="flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg cursor-pointer animate-pulse"
                >
                  <FaPlay className="mr-2 text-sm animate-bounce" style={{ verticalAlign: 'middle' }} />
                  Join Live Lecture
                </button>
              ) : (
                <button
                  onClick={() => onAttend(lecture)}
                  disabled={!lecture?.youtube_url || !lecture?.delivered}
                  className={`flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    lecture?.youtube_url && lecture?.delivered
                      ? 'bg-[#0d7c66] text-white hover:bg-[#0a6a58] shadow-md hover:shadow-lg cursor-pointer'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  <FaPlay className="mr-2 text-sm" style={{ verticalAlign: 'middle' }} />
                  {lecture?.youtube_url && lecture?.delivered 
                    ? 'Watch Lecture' 
                    : isTodayLecture 
                      ? 'Join Soon' 
                      : 'Upcoming Lecture'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureCard;
