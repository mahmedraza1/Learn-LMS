import React, { useState } from "react";
import LectureCard from "./LectureCard";
import { useLecture } from "../contexts/LectureContext";
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";

const CourseCard = ({ 
  course, 
  isAdmin = false,
  onEditLecture,
  onDeleteLecture,
  onAttendLecture,
  onVideoPreview
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { calculateLectureDates, getLecturesForCourse } = useLecture();
  
  // Get lectures for this course
  const lectures = getLecturesForCourse(course.id);
  
  // Calculate lecture dates for this course's batch
  const lectureDates = calculateLectureDates(course.batch);
  
  // Toggle expand/collapse
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Handlers for lecture actions
  const handleEditLecture = (lecture) => {
    if (onEditLecture) {
      onEditLecture(lecture);
    }
  };
  
  const handleDeleteLecture = (lecture) => {
    if (onDeleteLecture) {
      onDeleteLecture(lecture);
    }
  };
  
  const handleAttendLecture = (lecture) => {
    if (onAttendLecture) {
      onAttendLecture(lecture);
    } else if (onVideoPreview) {
      onVideoPreview(lecture);
    }
  };
  
  // Handler for video preview specifically for admin/instructor
  const handlePreviewLecture = (lecture) => {
    if (onVideoPreview) {
      onVideoPreview(lecture);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Course header */}
      <div 
        className="flex cursor-pointer items-center justify-between bg-gray-50 px-6 py-4"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
        <div className="flex items-center">
          {isExpanded ? (
            <FaAngleUp className="text-gray-500" />
          ) : (
            <FaAngleDown className="text-gray-500" />
          )}
        </div>
      </div>
      
      {/* Lectures grid - shown when expanded */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Generate 15 lecture cards based on requirements */}
            {lectureDates.map((date, index) => {
              const lectureNumber = index + 1;
              
              // Find a lecture for this date if it exists
              const matchingLecture = lectures.find(
                lecture => new Date(lecture.date).toDateString() === date.toDateString()
              );
              
              // If we found a matching lecture, make sure to use its data
              // Otherwise, create a placeholder with the correct number
              const lectureData = matchingLecture ? {
                ...matchingLecture,
                title: `Lecture ${lectureNumber}` // Ensure consistent naming
              } : {
                title: `Lecture ${lectureNumber}`
              };
              
              return (
                <LectureCard
                  key={index}
                  lecture={lectureData}
                  lectureNumber={lectureNumber}
                  isEditable={isAdmin}
                  onEdit={handleEditLecture}
                  onDelete={handleDeleteLecture}
                  onAttend={isAdmin ? handlePreviewLecture : handleAttendLecture}
                  scheduleDate={date}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
