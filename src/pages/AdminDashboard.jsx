import React, { useState } from "react";
import { useAuth, useBatch, useLecture, useAnnouncement } from "../hooks/reduxHooks";
import CourseCard from "../components/CourseCard";
import LectureForm from "../components/LectureForm";
import AnnouncementForm from "../components/AnnouncementForm";
import AdminGlobalAnnouncement from "../components/AdminGlobalAnnouncement";
import VideoModal from "../components/VideoModal";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { batches, courses, selectedBatch, setSelectedBatch } = useBatch();
  const { addLecture, updateLecture, deleteLecture, getLecturesForCourse } = useLecture();
  const { globalAnnouncements, addGlobalAnnouncement, updateGlobalAnnouncement, deleteGlobalAnnouncement } = useAnnouncement();
  
  // State for lecture form and video modal
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

  // Handler for adding global announcement
  const handleAddAnnouncement = () => {
    setAnnouncementForm({
      isOpen: true,
      announcement: null
    });
  };

  // Handler for editing global announcement
  const handleEditAnnouncement = (announcement) => {
    setAnnouncementForm({
      isOpen: true,
      announcement: announcement
    });
  };

  // Handler for deleting global announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this global announcement?")) {
      try {
        await deleteGlobalAnnouncement(announcementId);
        toast.success("Global announcement deleted successfully");
      } catch (error) {
        toast.error(`Failed to delete announcement: ${error.message}`);
      }
    }
  };

  // Handler for global announcement submission
  const handleAnnouncementSubmit = async (data) => {
    try {
      if (announcementForm.announcement) {
        // Update existing announcement
        await updateGlobalAnnouncement(announcementForm.announcement.id, {
          title: data.title,
          content: data.content,
          author: user.name || "Admin"
        });
        toast.success("Global announcement updated successfully");
      } else {
        // Add new announcement
        await addGlobalAnnouncement({
          title: data.title,
          content: data.content,
          author: user.name || "Admin"
        });
        toast.success("Global announcement added successfully");
      }
      
      setAnnouncementForm({ isOpen: false, announcement: null });
    } catch (error) {
      toast.error(`Failed to save announcement: ${error.message}`);
    }
  };
  
  // Get courses for the selected batch
  const batchCourses = courses[selectedBatch] || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome, {user.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Batch tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {batches.map(batch => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
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
        {/* Global Announcements Section */}
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Global Announcements</h2>
            <button
              onClick={handleAddAnnouncement}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Global Announcement
            </button>
          </div>
          
          {globalAnnouncements && globalAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {globalAnnouncements.map((announcement) => (
                <AdminGlobalAnnouncement
                  key={announcement.id}
                  announcement={announcement}
                  onEdit={handleEditAnnouncement}
                  onDelete={handleDeleteAnnouncement}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <p className="text-gray-600">No global announcements yet. Create one to get started!</p>
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Courses for {selectedBatch}
          </h2>
        </div>

        {batchCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              No courses available for this batch.
            </p>
          </div>
        ) : (
          batchCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={true}
              onEditLecture={(lecture) => handleEditLecture(lecture, course.id)}
              onDeleteLecture={(lecture) => handleDeleteLecture(lecture, course.id)}
              onVideoPreview={handleVideoPreview}
              onStartLecture={(lecture) => handleStartLecture(lecture, course.id)}
              onMarkDelivered={(lecture) => handleMarkDelivered(lecture, course.id)}
            />
          ))
        )}
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
