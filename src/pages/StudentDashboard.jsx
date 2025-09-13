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

  // Ensure we're using the correct batch format for accessing courses
  const formattedBatch = user.batch && user.batch.includes("Batch") ? 
    user.batch : 
    `Batch ${user.batch}`;
  
  // Get courses for the student's batch
  const batchCourses = courses[formattedBatch] || [];

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
                {formattedBatch}
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
            {formattedBatch === "Batch A" || formattedBatch === "Batch a"
              ? "Your lectures run from the 1st to the 27th of each month (excluding Fridays and the 31st). Remaining days are leave days."
              : "Your lectures run from the 16th of the current month to the 12th of the next month (excluding Fridays and the 31st)."}
          </p>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Today's date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            <span className="ml-3">
              {new Date().getDate() % 2 !== 0 ? 
                "(Today has 8 lectures from Batch A and 7 from Batch B)" : 
                "(Today has 7 lectures from Batch A and 8 from Batch B)"
              }
            </span>
          </div>
          <div className="mt-3 text-xs bg-gray-50 p-2 rounded">
            <p className="font-medium">Lecture Schedule Rules:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Lectures are never scheduled on Fridays</li>
              <li>Batch A: Runs from 1st to 27th of each month</li>
              <li>Batch B: Runs from 16th of current month to 12th of next month</li>
              <li>On odd dates: 8 lectures from Batch A, 7 from Batch B</li>
              <li>On even dates: 7 lectures from Batch A, 8 from Batch B</li>
            </ul>
          </div>
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
