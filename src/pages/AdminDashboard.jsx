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
      
      console.log("Lecture form submitted with data:", data);
      console.log("Original lecture data:", lecture);
      
      if (lecture && lecture.id && lecture.youtube_url) {
        // Update existing lecture
        await updateLecture(courseId, lecture.id, {
          lectureName: data.lectureName,
          lectureDate: data.lectureDate,
          lectureTime: data.lectureTime,
          youtubeUrl: data.youtubeUrl,
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
  
  // Handler for marking lecture as delivered
  const handleMarkDelivered = async (lecture, courseId) => {
    try {
      await updateLecture(courseId, lecture.id, {
        delivered: !lecture.delivered // Toggle delivered status
      });
      toast.success(lecture.delivered ? "Lecture marked as not delivered" : "Lecture marked as delivered");
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
        {/* Batch schedule info */}
        <div className="mb-6 rounded-lg border-l-4 border-[#0d7c66] bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-medium text-gray-800">Current Batch Schedule</h3>
          <p className="text-sm text-gray-600">
            {selectedBatch === "Batch A" 
              ? "Batch A lectures are scheduled on odd dates (1st, 3rd, 5th...) starting from the 1st of the current month, continuing into future months and years as needed."
              : "Batch B lectures are scheduled on even dates (16th, 18th, 20th...) starting from the 16th of the current month, continuing into future months and years as needed."}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Today's date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="mt-1 text-xs text-gray-500 italic">
            Note: When adding lectures, the system will automatically assign dates based on the batch schedule.
          </p>
        </div>
        
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
              onEditLecture={(lecture) => handleEditLecture(lecture, course.id)}
              onDeleteLecture={(lecture) => handleDeleteLecture(lecture, course.id)}
              onVideoPreview={handleVideoPreview}
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
