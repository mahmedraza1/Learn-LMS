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

  // State for CSV upload
  const [csvUploadStatus, setCsvUploadStatus] = useState({
    uploading: false,
    message: null,
    type: null // 'success' or 'error'
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

  // Handler for CSV upload
  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      event.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    setCsvUploadStatus({
      uploading: true,
      message: 'Uploading and processing CSV...',
      type: null
    });

    try {
      const response = await fetch('http://localhost:3001/api/upload-schedule-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCsvUploadStatus({
          uploading: false,
          message: `Schedule updated successfully! ${JSON.stringify(data.summary)}`,
          type: 'success'
        });
        toast.success('Schedule updated successfully! Page will reload in 2 seconds.');
        
        // Reload page after 2 seconds to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setCsvUploadStatus({
          uploading: false,
          message: data.error || 'Failed to update schedule',
          type: 'error'
        });
        toast.error(data.error || 'Failed to update schedule');
      }
    } catch (error) {
      setCsvUploadStatus({
        uploading: false,
        message: `Error: ${error.message}`,
        type: 'error'
      });
      toast.error(`Error: ${error.message}`);
    }

    // Reset file input
    event.target.value = null;
  };
  
  // Handler for lecture form submission
  // Helper function to generate YouTube thumbnail URL
  const generateYouTubeThumbnailUrl = (youtubeUrl) => {
    if (!youtubeUrl) return '';
    
    try {
      let videoId = null;
      
      if (youtubeUrl.includes('youtu.be/')) {
        const parts = youtubeUrl.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (youtubeUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(youtubeUrl);
        videoId = urlObj.searchParams.get('v');
      } else if (youtubeUrl.includes('youtube.com/embed/')) {
        const parts = youtubeUrl.split('embed/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (youtubeUrl.includes('youtube.com/live/')) {
        const parts = youtubeUrl.split('live/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch (err) {
      console.error("Invalid YouTube URL", err);
    }
    
    return '';
  };

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
          thumbnail_url: data.thumbnailUrl || generateYouTubeThumbnailUrl(data.youtubeUrl),
          delivered: lecture.delivered // preserve delivered status
        });
        toast.success("Lecture updated successfully");
      } else {
        // Add new lecture
        await addLecture(courseId, {
          lectureName: data.lectureName,
          lectureDate: data.lectureDate,
          lectureTime: data.lectureTime,
          youtubeUrl: data.youtubeUrl,
          thumbnailUrl: data.thumbnailUrl || generateYouTubeThumbnailUrl(data.youtubeUrl)
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
        
        {/* Tommorow's Courses Section */}
        {sortedBatchCourses.some(course => !hasTodayLecture(course.id)) && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">📚 Tommorow's Courses</h3>
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
        
        {/* CSV Upload Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">📅 Update Lecture Schedule</h3>
              <p className="mt-1 text-sm text-gray-600">
                Upload a CSV file to update all lecture dates and times
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={csvUploadStatus.uploading}
                className="hidden"
              />
            </label>
            
            {csvUploadStatus.uploading && (
              <div className="flex items-center text-gray-600">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </div>
            )}
          </div>
          
          {csvUploadStatus.message && (
            <div className={`mt-4 p-4 rounded-lg ${
              csvUploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{csvUploadStatus.message}</p>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📝 CSV Format:</strong> The CSV should have dates in the first column, time slots for different batch groups in columns 2-9, and day of the week in the last column.
            </p>
          </div>
        </div>
        
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
