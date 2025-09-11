import React, { useState } from "react";
import LectureCard from "./LectureCard";
import { useLecture } from "../contexts/LectureContext";
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";

const CourseCard = ({ 
  course, 
  isAdmin = false,
  onAddLecture,
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

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Course header */}
      <div 
        className="flex cursor-pointer items-center justify-between bg-gray-50 px-6 py-4"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
        <div className="flex items-center">
          {isAdmin && (
            <button 
              className="mr-4 flex items-center rounded-md bg-[#0d7c66] px-3 py-2 text-sm font-medium text-white hover:bg-[#0a6a58]"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddLecture) {
                  onAddLecture();
                }
              }}
            >
              <FaPlus className="mr-1" /> Add Lecture
            </button>
          )}
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
              // Find a lecture for this date if it exists
              const matchingLecture = lectures.find(
                lecture => new Date(lecture.date).toDateString() === date.toDateString()
              );
              
              return (
                <LectureCard
                  key={index}
                  lecture={matchingLecture}
                  lectureNumber={index + 1}
                  isEditable={isAdmin}
                  onEdit={handleEditLecture}
                  onDelete={handleDeleteLecture}
                  onAttend={handleAttendLecture}
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
