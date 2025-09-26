import React, { useState, useEffect } from 'react';
import { useAuth, useBatch } from '../../hooks/reduxHooks';
import LectureCard from '../LectureCard';
import VideoModal from '../VideoModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001/learnlive';

const LiveLectures = ({ course }) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchTab, setActiveBatchTab] = useState('Batch A');
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: ""
  });

  // Call hooks with fallback values
  const authData = useAuth() || { user: null, isAdmin: false };
  const batchData = useBatch() || { selectedBatch: 'Batch A' };

  // Safely destructure with defaults
  const user = authData?.user || null;
  const isAdmin = authData?.isAdmin || false;
  const selectedBatch = batchData?.selectedBatch || 'Batch A';

  // Determine which course IDs to fetch based on user role and batch
  const getCourseIds = () => {
    // Safety check for course object
    if (!course?.id) {
      return [];
    }

    if (isAdmin) {
      // Admin sees both batches - return both Batch A and Batch B IDs
      const batchAId = course.id;
      const batchBId = course.id + 100;
      return [batchAId, batchBId];
    } else {
      // Student sees only their batch
      const userBatch = user?.batch || selectedBatch || 'Batch A';
      if (userBatch === 'Batch B') {
        return [course.id + 100]; // Add 100 for Batch B
      } else {
        return [course.id]; // Use original ID for Batch A
      }
    }
  };

  // Get available batches for tabs (admin sees both, students see only their batch)
  const getAvailableBatches = () => {
    if (isAdmin) {
      return ['Batch A', 'Batch B'];
    } else {
      const userBatch = user?.batch || selectedBatch || 'Batch A';
      return [userBatch];
    }
  };

  const availableBatches = getAvailableBatches();

  // Fetch lectures for the course
  const fetchLecturesForCourse = async () => {
    try {
      setLoading(true);
      const courseIds = getCourseIds();
      const allLectures = [];

      // Fetch lectures for each relevant batch
      for (const courseId of courseIds) {
        // Determine which batch this courseId belongs to
        const batchName = courseId > 100 ? 'Batch B' : 'Batch A';
        
        try {
          const response = await axios.get(`${API_BASE_URL}/lectures/${batchName}`);
          const lecturesData = response.data?.lectures || {};
          
          // Get lectures for this specific course ID
          const courseLectures = lecturesData[courseId] || [];
          
          // Add batch information to each lecture
          const lecturesWithBatch = courseLectures.map(lecture => ({
            ...lecture,
            batch: batchName,
            course_id: courseId
          }));
          
          allLectures.push(...lecturesWithBatch);
        } catch (error) {
          console.warn(`Failed to fetch lectures for ${batchName}:`, error);
        }
      }

      // Sort lectures by date (newest first)
      allLectures.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      setLectures(allLectures);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  // Set initial active tab based on user role
  useEffect(() => {
    if (!isAdmin) {
      // For students, set the active tab to their batch
      const userBatch = user?.batch || selectedBatch || 'Batch A';
      setActiveBatchTab(userBatch);
    }
  }, [user?.batch, selectedBatch, isAdmin]);

  useEffect(() => {
    if (course?.id) {
      fetchLecturesForCourse();
    }
  }, [course?.id, selectedBatch, user?.batch]);

  const handleAttendLecture = (lecture) => {
    if (lecture.youtube_url) {
      setVideoModal({
        isOpen: true,
        videoUrl: lecture.youtube_url
      });
    }
  };

  const handleEditLecture = (lecture) => {
    console.log('Edit lecture:', lecture);
    // Implement edit functionality
  };

  const handleDeleteLecture = (lecture) => {
    console.log('Delete lecture:', lecture);
    // Implement delete functionality
  };

  const handleStartLecture = (lecture) => {
    console.log('Start lecture:', lecture);
    // Implement start lecture functionality
  };

  const handleMarkDelivered = (lecture) => {
    console.log('Mark delivered:', lecture);
    // Implement mark delivered functionality
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Lectures</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-gray-600">Loading lectures...</span>
        </div>
      </div>
    );
  }

  const groupLecturesByBatch = () => {
    const grouped = {};
    lectures.forEach(lecture => {
      const batch = lecture.batch || 'Unknown';
      if (!grouped[batch]) {
        grouped[batch] = [];
      }
      grouped[batch].push(lecture);
    });
    return grouped;
  };

  const groupedLectures = groupLecturesByBatch();
  
  // Get lectures for the active tab
  const getActiveBatchLectures = () => {
    return groupedLectures[activeBatchTab] || [];
  };

  const activeLectures = getActiveBatchLectures();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Live Lectures</h2>
        <div className="text-sm text-gray-500">
          Course: {course.name}
        </div>
      </div>

      {/* Batch Tabs - Only show if admin or if there are multiple batches */}
      {availableBatches.length > 1 && (
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {availableBatches.map((batch) => (
              <button
                key={batch}
                onClick={() => setActiveBatchTab(batch)}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeBatchTab === batch
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {batch}
                {groupedLectures[batch] && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {groupedLectures[batch].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content for active batch */}
      {lectures.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <p className="text-gray-600 mb-2">No lectures available for this course yet.</p>
          <p className="text-gray-500 text-sm">Lectures will appear here once they are scheduled.</p>
        </div>
      ) : activeLectures.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <p className="text-gray-600 mb-2">No lectures available for {activeBatchTab} yet.</p>
          <p className="text-gray-500 text-sm">Lectures will appear here once they are scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Batch header for single batch view or current active tab */}
          {!isAdmin && (
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mr-3">{activeBatchTab}</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {activeLectures.length} lecture{activeLectures.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeLectures.map((lecture, index) => {
              const scheduleDate = new Date(lecture.date);
              return (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  lectureNumber={lecture.lecture_number || index + 1}
                  scheduleDate={scheduleDate}
                  isEditable={isAdmin}
                  isAdmin={isAdmin}
                  onEdit={handleEditLecture}
                  onDelete={handleDeleteLecture}
                  onAttend={handleAttendLecture}
                  onStartLecture={handleStartLecture}
                  onMarkDelivered={handleMarkDelivered}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, videoUrl: "" })}
        videoUrl={videoModal.videoUrl}
      />
    </div>
  );
};

export default LiveLectures;