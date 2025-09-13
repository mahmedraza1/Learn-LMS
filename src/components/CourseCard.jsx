import React, { useState, useEffect } from "react";
import LectureCard from "./LectureCard";
import Announcement from "./Announcement";
import AnnouncementForm from "./AnnouncementForm";
import { useLecture } from "../contexts/LectureContext";
import { useAuth } from "../contexts/AuthContext";
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";

const CourseCard = ({ 
  course, 
  isAdmin = false,
  onEditLecture,
  onDeleteLecture,
  onAttendLecture,
  onVideoPreview,
  onMarkDelivered
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const { calculateLectureDates, getLecturesForCourse, getAnnouncementsForCourse, addAnnouncement, updateAnnouncement, deleteAnnouncement, hasTodayLecture } = useLecture();
  const { isAdmin: authIsAdmin } = useAuth();
  
  // Get lectures for this course
  const lectures = getLecturesForCourse(course.id);
  
  // Get announcements for this course
  const announcements = getAnnouncementsForCourse(course.id);
  
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
  
  // Handler for marking lecture as delivered
  const handleMarkDelivered = (lecture) => {
    if (onMarkDelivered) {
      onMarkDelivered(lecture);
    }
  };

  // Check if this course has a lecture scheduled for today
  const hasScheduledLectureToday = lectures.some(lecture => {
    const lectureDate = new Date(lecture.date);
    // Use September 13, 2025 for testing consistency
    const today = new Date("September 13, 2025");
    return (
      lectureDate.getDate() === today.getDate() &&
      lectureDate.getMonth() === today.getMonth() &&
      lectureDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Check if this course should have a lecture today according to the rules
  const shouldHaveLectureToday = hasTodayLecture(course.id);
  
  // More detailed debug information to help diagnose the issue
  console.log(`COURSE CARD: ${course.title} (${course.id}) in ${course.batch}, shouldHaveLecture: ${shouldHaveLectureToday}`);
  
  // Don't auto-expand any courses as per the requirement

  return (
    <div className={`mb-6 overflow-hidden rounded-lg ${shouldHaveLectureToday ? 'border-2 border-[#0d7c66]' : 'border border-gray-200'} bg-white shadow-sm`}>
      {/* Course header */}
      <div 
        className={`flex cursor-pointer items-center justify-between px-6 py-4 ${shouldHaveLectureToday ? 'bg-green-50' : 'bg-gray-50'}`}
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-bold text-gray-800">
          {course.title} <span className="text-xs font-normal text-gray-500">({course.batch})</span>
          {shouldHaveLectureToday && (
            <span className="ml-3 text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Today's Lecture
            </span>
          )}
        </h2>
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
          {/* Announcement section */}
          <div className="mb-6">
            {/* Add Announcement button - visible only to admins */}
            {isAdmin && (
              <button 
                className="mb-4 flex items-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnnouncementForm(true);
                  setEditingAnnouncement(null);
                }}
              >
                <FaPlus className="mr-2" /> Add Announcement
              </button>
            )}
            
            {/* Display announcements */}
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
            <div className="mb-6">
              <button 
                className="mb-4 flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
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
                <FaPlus className="mr-2" /> Add Lecture
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Only show lectures that have been added, no placeholders */}
            {lectures.map((lecture, index) => {
              const lectureNumber = lecture.lecture_number || index + 1;
              
              return (
                <LectureCard
                  key={lecture.id || index}
                  lecture={lecture}
                  lectureNumber={lectureNumber}
                  isEditable={isAdmin}
                  onEdit={handleEditLecture}
                  onDelete={handleDeleteLecture}
                  onAttend={isAdmin ? handlePreviewLecture : handleAttendLecture}
                  onMarkDelivered={handleMarkDelivered}
                  scheduleDate={new Date(lecture.date)}
                  isAdmin={isAdmin}
                />
              );
            })}
            
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
