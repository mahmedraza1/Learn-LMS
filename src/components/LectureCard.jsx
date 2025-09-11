import React from "react";
import { useLecture } from "../contexts/LectureContext";
import { FaYoutube, FaEdit, FaTrash, FaClock } from "react-icons/fa";

const LectureCard = ({ 
  lecture, 
  lectureNumber, 
  isEditable = false, 
  onEdit,
  onDelete,
  onAttend,
  scheduleDate
}) => {
  const { isToday } = useLecture();
  const isLectureToday = isToday(scheduleDate);
  
  // Format date to display in card
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get YouTube thumbnail URL if available
  const getThumbnailUrl = () => {
    if (!lecture?.youtube_url) return null;
    
    try {
      const url = new URL(lecture.youtube_url);
      const videoId = url.searchParams.get('v');
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    } catch (err) {
      console.error("Invalid YouTube URL", err);
    }
    
    return null;
  };

  const cardClassName = `relative rounded-lg overflow-hidden shadow ${
    isLectureToday 
      ? 'bg-white border-2 border-[#0d7c66]' 
      : 'bg-white/70 border border-gray-200'
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
          <div className="flex items-center space-x-1">
            <FaClock className="text-gray-500" />
            <span>{formatDate(scheduleDate)}</span>
          </div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold">
          Lecture {lectureNumber}
        </h3>
        
        {/* Actions */}
        <div className="mt-3 flex justify-between">
          {isEditable ? (
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(lecture)}
                className="flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => onDelete(lecture)}
                className="flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAttend(lecture)}
              disabled={!isLectureToday || !lecture?.youtube_url}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                isLectureToday && lecture?.youtube_url
                  ? 'bg-[#0d7c66] text-white hover:bg-[#0a6a58]'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
            >
              {lecture?.youtube_url ? 'Attend' : 'Not Available'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureCard;
