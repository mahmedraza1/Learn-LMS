import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBatch } from "../contexts/BatchContext";
import { useLecture } from "../contexts/LectureContext";
import CourseCard from "../components/CourseCard";
import VideoModal from "../components/VideoModal";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { courses, selectedBatch, loading } = useBatch();
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: ""
  });

  // Handler for opening video modal
  const handleAttendLecture = (lecture) => {
    if (lecture?.youtube_url) {
      setVideoModal({
        isOpen: true,
        videoUrl: lecture.youtube_url
      });
    }
  };

  // Close video modal
  const closeVideoModal = () => {
    setVideoModal({
      isOpen: false,
      videoUrl: ""
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-lg font-medium text-gray-700">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const batchCourses = courses[user.batch] || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center rounded-md bg-[#0d7c66]/10 px-3 py-1 text-sm font-medium text-[#0d7c66]">
                {user.batch}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Batch schedule info */}
        <div className="mb-6 rounded-lg border-l-4 border-[#0d7c66] bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-medium text-gray-800">Your Lecture Schedule</h3>
          <p className="text-sm text-gray-600">
            {user.batch === "Batch A" 
              ? "Your lectures are scheduled on odd dates (1st, 3rd, 5th...) from the 1st of this month to the 1st of next month."
              : "Your lectures are scheduled on even dates (16th, 18th, 20th...) from the 15th of this month to the 15th of next month."}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Today's date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <h2 className="mb-6 text-xl font-bold text-gray-800">My Courses</h2>

        {batchCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              No courses assigned yet. Please check back later.
            </p>
          </div>
        ) : (
          batchCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={false}
              onAttendLecture={handleAttendLecture}
            />
          ))
        )}
      </main>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={closeVideoModal}
        videoUrl={videoModal.videoUrl}
      />
    </div>
  );
};

export default StudentDashboard;
