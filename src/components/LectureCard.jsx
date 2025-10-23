import React from "react";
import { useLecture } from "../hooks/reduxHooks";
import { useAppSelector } from "../store/hooks";
import { selectCanAccessLiveLectures, selectIsUpcomingBatchStudent } from "../store/slices/authSlice";
import { FaYoutube, FaEdit, FaTrash, FaClock, FaPlay, FaCheck, FaCalendarAlt, FaClock as FaClockCircle, FaStop, FaLock } from "react-icons/fa";

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
  const canAccessLiveLectures = useAppSelector(selectCanAccessLiveLectures);
  const isUpcomingBatchStudent = useAppSelector(selectIsUpcomingBatchStudent);
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
  
  // Check if lecture is currently live
  const isLive = () => {
    // First check if manually marked as currently live
    if (lecture?.currentlyLive) return true;
    
    // Otherwise check if within time window
    if (!lecture?.date || !lecture?.time) return false;
    
    const now = new Date();
    const lectureDateTime = new Date(`${lecture.date}T${lecture.time}`);
    const timeDifference = Math.abs(now - lectureDateTime);
    
    // Consider live if within 30 minutes of scheduled time
    return timeDifference <= 30 * 60 * 1000;
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
    // First, check if there's a custom thumbnail URL
    if (lecture?.thumbnail_url && lecture.thumbnail_url.trim() !== '') {
      return lecture.thumbnail_url;
    }
    
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
        } else if (lecture.youtube_url.includes('youtube.com/live/')) {
          // Live URL format: https://youtube.com/live/VIDEO_ID
          const parts = lecture.youtube_url.split('live/');
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
      {/* Thumbnail or placeholder - 16:9 aspect ratio */}
      <div className="relative w-full aspect-video bg-gray-100">
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
        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 rounded-full bg-white/80 border border-gray-200 px-2 sm:px-3 py-1 text-xs font-medium shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <FaClock className="w-2 h-2 sm:w-3 sm:h-3 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-800">{formatDate(scheduleDate)}</span>
            </div>
            <div className="flex items-center text-xs font-medium">
              <FaCalendarAlt className="mr-1 text-[8px] sm:text-[10px] text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-800">{getDayOfWeek(scheduleDate)}</span>
            </div>
          </div>
        </div>
        
        {/* Status Badge at top-right corner */}
        <div className={`absolute top-1 sm:top-2 right-1 sm:right-2 rounded-full px-2 sm:px-3 py-1 text-xs font-medium shadow-sm ${
          lecture?.delivered 
            ? 'bg-green-100 text-green-800' 
            : isLive()
              ? 'bg-red-100 text-red-800 animate-pulse'
              : isTodayLecture 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
        }`}>
          {lecture?.delivered ? (
            <span className="flex items-center">
              <FaCheck className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Delivered</span>
              <span className="sm:hidden">Done</span>
            </span>
          ) : isLive() ? (
            <span className="flex items-center">
              <div className="mr-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline font-semibold">LIVE</span>
              <span className="sm:hidden font-semibold">LIVE</span>
            </span>
          ) : isTodayLecture ? (
            <span className="flex items-center">
              <FaClock className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Available</span>
              <span className="sm:hidden">Now</span>
            </span>
          ) : (
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Upcoming</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-3 sm:p-4">
        <h3 className="mb-2 text-base sm:text-lg font-semibold">
          <div className="break-words leading-tight">
            {lecture?.title || `Lecture ${lectureNumber}`}
          </div>
          {lecture?.delivered && (
            <span className="mt-1 inline-flex text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded items-center">
              <FaCheck className="mr-1 w-2 h-2" />
              <span className="hidden sm:inline">Delivered</span>
            </span>
          )}
        </h3>
        
        {/* Info section with organized details */}
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1">
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
        <div className="mt-3 sm:mt-4 flex justify-between">
          {isEditable ? (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button 
                onClick={() => onEdit(lecture)}
                className={`flex items-center rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium ${
                  !lecture?.youtube_url 
                    ? 'bg-[#0d7c66] text-white hover:bg-[#0a6a58]'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <FaEdit className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{!lecture?.youtube_url ? 'Add Lecture' : 'Edit'}</span>
                <span className="sm:hidden">{!lecture?.youtube_url ? 'Add' : 'Edit'}</span>
              </button>
              {lecture?.youtube_url && (
                <>
                  <button 
                    onClick={() => onAttend(lecture)}
                    className="flex items-center rounded-md bg-purple-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100"
                  >
                    <FaPlay className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button 
                    onClick={() => onDelete(lecture)}
                    className="flex items-center rounded-md bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <FaTrash className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  {isAdmin && (
                    <>
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
              {isCurrentlyLive && canAccessLiveLectures ? (
                <button
                  onClick={() => onAttend(lecture)}
                  className="flex items-center justify-center rounded-md px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg cursor-pointer animate-pulse"
                >
                  <FaPlay className="mr-1 sm:mr-2 text-xs sm:text-sm animate-bounce" style={{ verticalAlign: 'middle' }} />
                  <span className="hidden sm:inline">Join Live Lecture</span>
                  <span className="sm:hidden">Join Live</span>
                </button>
              ) : isCurrentlyLive && !canAccessLiveLectures ? (
                <div className="flex flex-col items-center w-full">
                  <button
                    disabled
                    className="flex items-center justify-center rounded-md px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-not-allowed bg-gray-100 text-gray-400 w-full"
                  >
                    <FaLock className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>Live Class Locked</span>
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-600">
                    Available when your batch starts
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => onAttend(lecture)}
                  disabled={!lecture?.youtube_url || !lecture?.delivered}
                  className={`flex items-center justify-center rounded-md px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    lecture?.youtube_url && lecture?.delivered
                      ? 'bg-[#0d7c66] text-white hover:bg-[#0a6a58] shadow-md hover:shadow-lg cursor-pointer'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  <FaPlay className="mr-1 sm:mr-2 text-xs sm:text-sm" style={{ verticalAlign: 'middle' }} />
                  <span className="truncate">
                    {lecture?.youtube_url && lecture?.delivered 
                      ? 'Watch Lecture' 
                      : isTodayLecture 
                        ? 'Join' 
                        : 'Upcoming Lecture'}
                  </span>
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
