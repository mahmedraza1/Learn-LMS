import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBatch } from "../contexts/BatchContext";
import { useLecture } from "../contexts/LectureContext";
import CourseCard from "../components/CourseCard";
import LectureForm from "../components/LectureForm";
import VideoModal from "../components/VideoModal";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { batches, courses, selectedBatch, setSelectedBatch } = useBatch();
  const { addLecture, updateLecture, deleteLecture } = useLecture();
  
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
  
  // Handler for opening lecture form
  const handleAddLecture = (courseId) => {
    setLectureForm({
      isOpen: true,
      courseId,
      lecture: null
    });
  };
  
  // Handler for editing lecture
  const handleEditLecture = (lecture, courseId) => {
    setLectureForm({
      isOpen: true,
      courseId,
      lecture
    });
  };
  
  // Handler for deleting lecture
  const handleDeleteLecture = async (lecture, courseId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteLecture(courseId, lecture.id);
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
      
      if (lecture) {
        // Update existing lecture
        await updateLecture(courseId, lecture.id, {
          title: data.title,
          youtube_url: data.youtubeUrl,
          date: new Date(data.date)
        });
        toast.success("Lecture updated successfully");
      } else {
        // Add new lecture
        await addLecture(courseId, {
          title: data.title,
          youtubeUrl: data.youtubeUrl,
          date: new Date(data.date)
        });
        toast.success("Lecture added successfully");
      }
    } catch (error) {
      toast.error("Failed to save lecture");
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
        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Courses for {selectedBatch}
        </h2>

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
              onAddLecture={() => handleAddLecture(course.id)}
              onEditLecture={(lecture) => handleEditLecture(lecture, course.id)}
              onDeleteLecture={(lecture) => handleDeleteLecture(lecture, course.id)}
              onVideoPreview={handleVideoPreview}
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
