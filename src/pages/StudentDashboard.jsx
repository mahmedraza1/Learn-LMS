import React, { useState, useMemo } from "react";
import { useAuth, useBatch, useLecture } from "../hooks/reduxHooks";
import CourseCard from "../components/CourseCard";
import VideoModal from "../components/VideoModal";
import LiveClassAnnouncement from "../components/LiveClassAnnouncement";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { courses, selectedBatch, loading } = useBatch();
  const { hasTodayLecture } = useLecture();
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

  // Ensure we're using the correct batch format for accessing courses - MUST be before early return
  const formattedBatch = user?.batch && user.batch.includes("Batch") ? 
    user.batch : 
    `Batch ${user?.batch || 'A'}`;
  
  // Get courses for the student's batch and sort them (today's lectures first) - MUST be before early return
  const sortedBatchCourses = useMemo(() => {
    const batchCourses = courses[formattedBatch] || [];
    
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
  }, [courses, formattedBatch, hasTodayLecture]);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Today's Live Lectures</h1>
              <p className="mt-1 text-sm sm:text-base lg:text-lg text-gray-600">
                Take your learning experience to the next level with live lectures. Learn in real time, interact with instructors, and get your questions answered.
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
        {/* Live Class Announcement */}
        <LiveClassAnnouncement isAdmin={false} />
        
        <h2 className="mb-6 text-xl font-bold text-gray-800">My Courses</h2>

        {sortedBatchCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              No courses assigned yet. Please check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Today's Lectures Section */}
            {sortedBatchCourses.some(course => hasTodayLecture(course.id)) && (
              <div className="mb-8">
                <div className="mb-4 flex items-center">
                  <h3 className="text-lg font-semibold text-gray-800">📚 Today's Active Lectures</h3>
                  <div className="ml-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Live Now
                  </div>
                </div>
                {sortedBatchCourses
                  .filter(course => hasTodayLecture(course.id))
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isAdmin={false}
                      onAttendLecture={handleAttendLecture}
                    />
                  ))
                }
              </div>
            )}
            
            {/* Other Courses Section */}
            {sortedBatchCourses.some(course => !hasTodayLecture(course.id)) && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-800">📋 Other Courses</h3>
                {sortedBatchCourses
                  .filter(course => !hasTodayLecture(course.id))
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isAdmin={false}
                      onAttendLecture={handleAttendLecture}
                    />
                  ))
                }
              </div>
            )}
          </>
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
