import React, { useState, useEffect, useMemo } from "react";
import LectureCard from "./LectureCard";
import Announcement from "./Announcement";
import AnnouncementForm from "./AnnouncementForm";
import { useLecture, useAuth } from "../hooks/reduxHooks";
import { useAppSelector } from "../store/hooks";
import { selectLectures, selectAnnouncements } from "../store/slices/lectureSlice";
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";

const CourseCard = ({ 
  course, 
  isAdmin = false,
  onEditLecture,
  onDeleteLecture,
  onAttendLecture,
  onVideoPreview,
  onStartLecture,
  onMarkDelivered
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const { calculateLectureDates, addAnnouncement, updateAnnouncement, deleteAnnouncement, hasTodayLecture } = useLecture();
  const { isAdmin: authIsAdmin } = useAuth();
  
  // Direct Redux selectors for real-time updates
  const allLectures = useAppSelector(selectLectures);
  const allAnnouncements = useAppSelector(selectAnnouncements);
  
  // Get lectures for this course (reactive to Redux changes) with proper date sorting
  const lectures = useMemo(() => {
    const courseIdString = String(course.id);
    const courseLectures = allLectures[courseIdString] || [];
    
    // Sort lectures by date (chronological order - oldest first)
    return [...courseLectures].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [allLectures, course.id]);
  
  // Get announcements for this course (reactive to Redux changes)
  const announcements = useMemo(() => {
    const courseIdString = String(course.id);
    const courseAnnouncements = allAnnouncements[courseIdString] || [];
    return [...courseAnnouncements].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [allAnnouncements, course.id]);
  
  // Calculate lecture dates for this course's batch
  const lectureDates = calculateLectureDates(course.batch);
  
  // Memoize current month lectures to prevent infinite re-renders
  const currentMonthLectures = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return lectures.filter(lecture => {
      const lectureDate = lecture.date ? new Date(lecture.date) : null;
      return lectureDate && 
             lectureDate.getMonth() === currentMonth && 
             lectureDate.getFullYear() === currentYear;
    });
  }, [lectures]);
  
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
  
  // Handler for starting lecture
  const handleStartLecture = (lecture) => {
    if (onStartLecture) {
      onStartLecture(lecture);
    }
  };
  
  // Handler for marking lecture as delivered
  const handleMarkDelivered = (lecture) => {
    if (onMarkDelivered) {
      onMarkDelivered(lecture);
    }
  };

  // Check if this course has a lecture scheduled for today
  const hasScheduledLectureToday = lectures.some(lecture => {
    const lectureDate = new Date(lecture.date);
    // Use current date
    const today = new Date();
    return (
      lectureDate.getDate() === today.getDate() &&
      lectureDate.getMonth() === today.getMonth() &&
      lectureDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Check if this course should have a lecture today according to the rules
  const shouldHaveLectureToday = hasTodayLecture(course.id);
  
  // Don't auto-expand any courses as per the requirement

  return (
    <div className={`mb-4 sm:mb-6 overflow-hidden rounded-lg ${shouldHaveLectureToday ? 'border-2 border-[#0d7c66]' : 'border border-gray-200'} bg-white shadow-sm`}>
      {/* Course header */}
      <div 
        className={`flex cursor-pointer items-center justify-between px-3 sm:px-6 py-3 sm:py-4 ${shouldHaveLectureToday ? 'bg-green-50' : 'bg-gray-50'}`}
        onClick={toggleExpand}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {course.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-normal text-gray-500">({course.batch})</span>
            {shouldHaveLectureToday && (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Today's Lecture
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          {isExpanded ? (
            <FaAngleUp className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <FaAngleDown className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
      </div>
      
      {/* Lectures grid - shown when expanded */}
      {isExpanded && (
        <div className="p-3 sm:p-6">
          {/* Announcement section */}
          <div className="mb-6">
            {/* Add Announcement button - visible only to admins */}
            {isAdmin && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnnouncementForm(true);
                }}
                className="mb-3 sm:mb-4 flex items-center rounded-md bg-green-50 px-3 sm:px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                <FaPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Add Announcement
              </button>
            )}            {/* Display announcements */}
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <Announcement 
                    key={announcement.id}
                    announcement={announcement}
                    isAdmin={isAdmin}
                    onEdit={(announcement) => {
                      setEditingAnnouncement(announcement);
                      setShowAnnouncementForm(true);
                    }}
                    onDelete={(announcement) => {
                      if (window.confirm('Are you sure you want to delete this announcement?')) {
                        deleteAnnouncement(course.id, announcement.id);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No announcements yet.</p>
            )}
            
            {/* Announcement Form Modal */}
            <AnnouncementForm
              isOpen={showAnnouncementForm}
              onClose={() => {
                setShowAnnouncementForm(false);
                setEditingAnnouncement(null);
              }}
              announcement={editingAnnouncement}
              onSubmit={(data) => {
                if (editingAnnouncement) {
                  updateAnnouncement(course.id, editingAnnouncement.id, data);
                } else {
                  addAnnouncement(course.id, data);
                }
              }}
            />
          </div>
          
          {/* Add Lecture button - visible only to admins/instructors */}
          {isAdmin && (
            <div className="mb-4 sm:mb-6">
              <button 
                className="mb-3 sm:mb-4 flex items-center rounded-md bg-green-50 px-3 sm:px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                onClick={(e) => {
                  e.stopPropagation();
                  // Create an empty lecture object to be edited
                  const emptyLecture = {
                    course_id: course.id,
                    course: course,
                    batch: course.batch
                  };
                  handleEditLecture(emptyLecture);
                }}
              >
                <FaPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Add Lecture
              </button>
            </div>
          )}
          
          {/* Lecture grid */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lectures.length > 0 ? (
              lectures.map((lecture, index) => {
                // Find the original index in the full lectures array to get correct lecture number
                const originalIndex = lectures.findIndex(l => l.id === lecture.id);
                const lectureNumber = lecture.lecture_number || (originalIndex !== -1 ? originalIndex + 1 : index + 1);
                
                return (
                  <LectureCard
                    key={lecture.id || index}
                    lecture={lecture}
                    lectureNumber={lectureNumber}
                    isEditable={isAdmin}
                    onEdit={handleEditLecture}
                    onDelete={handleDeleteLecture}
                    onAttend={isAdmin ? handlePreviewLecture : handleAttendLecture}
                    onStartLecture={handleStartLecture}
                    onMarkDelivered={handleMarkDelivered}
                    scheduleDate={new Date(lecture.date)}
                    isAdmin={isAdmin}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500 italic">No lectures available for the current period.</p>
              </div>
            )}
            
            {lectures.length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500 italic">
                  {isAdmin ? "No lectures yet. Click 'Add Lecture' to create one." : "No lectures available yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
