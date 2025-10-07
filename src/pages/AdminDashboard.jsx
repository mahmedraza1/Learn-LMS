import React, { useState, useMemo } from "react";
import { useAuth, useBatch, useLecture } from "../hooks/reduxHooks";
import { useAppDispatch } from "../store/hooks";
import { addGlobalAnnouncement, updateGlobalAnnouncement } from "../store/slices/announcementSlice";
import CourseCard from "../components/CourseCard";
import LectureForm from "../components/LectureForm";
import AnnouncementForm from "../components/AnnouncementForm";
import VideoModal from "../components/VideoModal";
import LiveClassAnnouncement from "../components/LiveClassAnnouncement";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  
  // Call hooks individually to ensure stable order
  const authData = useAuth();
  const batchData = useBatch();
  const lectureData = useLecture();
  
  // State for lecture form and video modal - MUST be called before any early returns
  const [lectureForm, setLectureForm] = useState({
    isOpen: false,
    courseId: null,
    lecture: null
  });
  
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: ""
  });

  // State for announcement form
  const [announcementForm, setAnnouncementForm] = useState({
    isOpen: false,
    announcement: null
  });
  
  // Destructure after hook calls to avoid conditional destructuring
  const { user } = authData;
  const { batches, courses, selectedBatch, setSelectedBatch, loading: batchLoading } = batchData;
  const { addLecture, updateLecture, deleteLecture, getLecturesForCourse, hasTodayLecture } = lectureData;
  
  // Get courses for the selected batch with safety checks and sort them - MUST be before early returns
  const sortedBatchCourses = useMemo(() => {
    const batchCourses = (courses && selectedBatch && courses[selectedBatch]) ? courses[selectedBatch] : [];
    
    // Sort courses: courses with today's lectures first, then the rest
    return [...batchCourses].sort((a, b) => {
      const aHasLectureToday = hasTodayLecture(a.id);
      const bHasLectureToday = hasTodayLecture(b.id);
      
      // If both have lectures today or both don't, maintain original order
      if (aHasLectureToday === bHasLectureToday) {
        return 0;
      }
      
      // Put courses with today's lectures first
      return aHasLectureToday ? -1 : 1;
    });
  }, [courses, selectedBatch, hasTodayLecture]);
  
  // Early return if still loading - but AFTER all hooks are called
  if (batchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Handler for editing lecture - now handles both editing and adding lectures
  const handleEditLecture = (lecture, courseId) => {
    // If courseId is provided separately, use it, otherwise get it from the lecture
    const actualCourseId = courseId || lecture?.course_id;
    const course = courses[selectedBatch]?.find(c => c.id === parseInt(actualCourseId));
    
    // Create a copy of the lecture with course information to help with date validation
    const lectureWithCourse = {
      ...lecture,
      course: course
    };
    
    setLectureForm({
      isOpen: true,
      courseId: actualCourseId,
      lecture: lectureWithCourse
    });
  };
  
  // Handler for deleting lecture
  const handleDeleteLecture = async (lecture, courseId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteLecture(lecture.id, courseId);
        toast.success("Lecture deleted successfully");
      } catch (error) {
        toast.error("Failed to delete lecture");
      }
    }
  };
  
  // Handler for lecture form submission
  const handleLectureFormSubmit = async (data) => {
    try {
      const { courseId, lecture } = lectureForm;
      
      if (lecture && lecture.id && lecture.youtube_url) {
        // Update existing lecture
        await updateLecture(courseId, lecture.id, {
          title: data.lectureName,
          date: data.lectureDate,
          time: data.lectureTime,
          youtube_url: data.youtubeUrl,
          delivered: lecture.delivered // preserve delivered status
        });
        toast.success("Lecture updated successfully");
      } else {
        // Add new lecture
        await addLecture(courseId, {
          lectureName: data.lectureName,
          lectureDate: data.lectureDate,
          lectureTime: data.lectureTime,
          youtubeUrl: data.youtubeUrl
        });
        
        toast.success("Lecture added successfully");
      }
    } catch (error) {
      toast.error(`Failed to save lecture: ${error.message}`);
    }
  };
  
  // Handler for starting lecture (marking as live/in progress)
  const handleStartLecture = async (lecture, courseId) => {
    try {
      await updateLecture(courseId, lecture.id, {
        currentlyLive: true,
        delivered: false // Reset delivered status when starting
      });
      
      toast.success("Lecture started - now live!");
    } catch (error) {
      console.error("Error starting lecture:", error);
      toast.error("Failed to start lecture");
    }
  };

  // Handler for marking lecture as delivered (automatically ends live status)
  const handleMarkDelivered = async (lecture, courseId) => {
    try {
      if (lecture.delivered) {
        // Toggle back to not delivered
        await updateLecture(courseId, lecture.id, {
          delivered: false,
          currentlyLive: false
        });
        toast.success("Lecture marked as not delivered");
      } else {
        // Mark as delivered and end live status
        await updateLecture(courseId, lecture.id, {
          delivered: true,
          currentlyLive: false // Always end live status when marking as delivered
        });
        toast.success("Lecture delivered successfully!");
      }
      
    } catch (error) {
      toast.error("Failed to update lecture status");
    }
  };


  
  // Handler for opening video preview
  const handleVideoPreview = (lecture) => {
    if (lecture?.youtube_url) {
      setVideoModal({
        isOpen: true,
        videoUrl: lecture.youtube_url
      });
    }
  };

  // Handler for global announcement form submission
  const handleAnnouncementSubmit = async (data) => {
    try {
      if (announcementForm.announcement) {
        // Edit existing announcement
        await dispatch(updateGlobalAnnouncement({
          id: announcementForm.announcement.id,
          data
        })).unwrap();
        toast.success("Announcement updated successfully");
      } else {
        // Add new announcement
        await dispatch(addGlobalAnnouncement(data)).unwrap();
        toast.success("Announcement added successfully");
      }
      
      setAnnouncementForm({ isOpen: false, announcement: null });
    } catch (error) {
      toast.error(`Failed to save announcement: ${error.message}`);
    }
  };
  
  // Render course cards - ensure stable component structure with organized sections
  const renderCourses = () => {
    if (sortedBatchCourses.length === 0) {
      return (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            No courses available for this batch.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Today's Active Lectures Section */}
        {sortedBatchCourses.some(course => hasTodayLecture(course.id)) && (
          <div className="mb-8">
            <div className="mb-4 flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Today's Active Lectures</h3>
              <div className="ml-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Manage Live
              </div>
            </div>
            {sortedBatchCourses
              .filter(course => hasTodayLecture(course.id))
              .map((course) => (
                <CourseCard
                  key={`active-${selectedBatch}-${course.id}`}
                  course={course}
                  isAdmin={true}
                  onEditLecture={(lecture) => handleEditLecture(lecture, course.id)}
                  onDeleteLecture={(lecture) => handleDeleteLecture(lecture, course.id)}
                  onVideoPreview={handleVideoPreview}
                  onStartLecture={(lecture) => handleStartLecture(lecture, course.id)}
                  onMarkDelivered={(lecture) => handleMarkDelivered(lecture, course.id)}
                />
              ))
            }
          </div>
        )}
        
        {/* Other Courses Section */}
        {sortedBatchCourses.some(course => !hasTodayLecture(course.id)) && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">📚 Other Courses</h3>
            {sortedBatchCourses
              .filter(course => !hasTodayLecture(course.id))
              .map((course) => (
                <CourseCard
                  key={`all-${selectedBatch}-${course.id}`}
                  course={course}
                  isAdmin={true}
                  onEditLecture={(lecture) => handleEditLecture(lecture, course.id)}
                  onDeleteLecture={(lecture) => handleDeleteLecture(lecture, course.id)}
                  onVideoPreview={handleVideoPreview}
                  onStartLecture={(lecture) => handleStartLecture(lecture, course.id)}
                  onMarkDelivered={(lecture) => handleMarkDelivered(lecture, course.id)}
                />
              ))
            }
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Batch tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {(batches || []).map(batch => (
              <button
                key={batch}
                onClick={() => setSelectedBatch && setSelectedBatch(batch)}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  selectedBatch === batch
                    ? 'border-[#0d7c66] text-[#0d7c66]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {batch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Live Class Announcement */}
        <LiveClassAnnouncement isAdmin={true} />
        
        {/* Courses Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Courses for {selectedBatch}
          </h2>
        </div>

        {renderCourses()}
      </main>

      {/* Lecture Form Modal */}
      <LectureForm
        isOpen={lectureForm.isOpen}
        onClose={() => setLectureForm({ isOpen: false, courseId: null, lecture: null })}
        onSubmit={handleLectureFormSubmit}
        lecture={lectureForm.lecture}
        batch={selectedBatch}
      />

      {/* Global Announcement Form Modal */}
      <AnnouncementForm
        isOpen={announcementForm.isOpen}
        onClose={() => setAnnouncementForm({ isOpen: false, announcement: null })}
        onSubmit={handleAnnouncementSubmit}
        announcement={announcementForm.announcement}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, videoUrl: "" })}
        videoUrl={videoModal.videoUrl}
      />
    </div>
  );
};

export default AdminDashboard;
