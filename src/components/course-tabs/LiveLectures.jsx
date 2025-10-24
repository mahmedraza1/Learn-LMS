import React, { useState, useEffect } from 'react';
import { useAuth, useBatch } from '../../hooks/reduxHooks';
import { useAppSelector } from '../../store/hooks';
import { selectIsUpcomingBatchStudent } from '../../store/slices/authSlice';
import LectureCard from '../LectureCard';
import VideoModal from '../VideoModal';
import LiveChat from '../LiveChat';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaComments, FaTimes } from 'react-icons/fa';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/learnlive';
  }
  return 'http://localhost:3001/learnlive';
};

const API_BASE_URL = getApiBaseUrl();

const LiveLectures = ({ course }) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchTab, setActiveBatchTab] = useState('Batch A');
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: "",
    lecture: null,
    isLive: false
  });
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [activeLiveLecture, setActiveLiveLecture] = useState(null);

  // Call hooks with fallback values
  const authData = useAuth() || { user: null, isAdmin: false };
  const batchData = useBatch() || { selectedBatch: 'Batch A' };
  const isUpcomingBatchStudent = useAppSelector(selectIsUpcomingBatchStudent);

  // Safely destructure with defaults
  const user = authData?.user || null;
  const isAdmin = authData?.isAdmin || false;
  const selectedBatch = batchData?.selectedBatch || 'Batch A';

  // If upcoming batch student, show restriction message
  if (isUpcomingBatchStudent) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-blue-900">Live Lectures Coming Soon!</h2>
            <p className="text-lg text-blue-800 mb-4">
              You are enrolled in <strong>{user.upcoming_batch?.includes("A") ? "Batch A" : user.upcoming_batch?.includes("B") ? "Batch B" : user.upcoming_batch}</strong>
            </p>
            <p className="text-blue-700 mb-6">
              Live lecture access will be available when your batch starts  by <b>{
                   user.upcoming_batch.includes("A") ? " 1st date of next month" : user.upcoming_batch.includes("B") ? " 15th date of this month" : "the scheduled date"
                  }</b>. In the meantime, you can:
            </p>
            <div className="bg-white rounded-lg p-6 text-left mb-6">
              <ul className="space-y-3 text-blue-900">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📹 Watch recorded lectures</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>👥 Join Your Community Groups</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📚 Access course notes and study materials</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>❓ Review FAQs for this course</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📖 Read course overview and announcements</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-blue-600">
              💡 Check the other tabs above to access available resources!
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      // Sort lectures by date (oldest first - chronological order)
      allLectures.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

      setLectures(allLectures);
      
      // Check for active live lectures
      const liveLecture = allLectures.find(lecture => lecture.currentlyLive);
      console.log('Live lecture check:', { liveLecture, activeLiveLecture, user });
      
      if (liveLecture && !activeLiveLecture) {
        console.log('Setting active live lecture:', liveLecture.title);
        setActiveLiveLecture(liveLecture);
        setShowLiveChat(true); // Auto-show chat when live lecture is detected
      } else if (!liveLecture && activeLiveLecture) {
        console.log('Clearing active live lecture');
        setActiveLiveLecture(null);
        setShowLiveChat(false);
      }
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
      // Check if lecture is currently live - either marked as live by admin OR within time window
      const now = new Date();
      const lectureDateTime = new Date(`${lecture.date}T${lecture.time}`);
      const timeDifference = Math.abs(now - lectureDateTime);
      const isWithinTimeWindow = timeDifference <= 30 * 60 * 1000; // 30 minutes in milliseconds
      const isLive = lecture.currentlyLive || isWithinTimeWindow;
      
      console.log('Opening video modal:', {
        lecture: lecture.title,
        currentlyLive: lecture.currentlyLive,
        isWithinTimeWindow,
        finalIsLive: isLive
      });
      
      setVideoModal({
        isOpen: true,
        videoUrl: lecture.youtube_url,
        lecture: lecture,
        isLive: isLive
      });
    }
  };

  const handleEditLecture = (lecture) => {
    // Implement edit functionality
  };

  const handleDeleteLecture = (lecture) => {
    // Implement delete functionality
  };

  const handleStartLecture = async (lecture) => {
    console.log('🚀 Starting lecture function called:', lecture.title);
    if (!isAdmin) {
      toast.error("Only admins can start lectures");
      return;
    }

    try {
      // FIXED URL: Removed extra /api/ part
      const apiUrl = `${API_BASE_URL}/lectures/${lecture.id}`;
      console.log('🔥 UPDATED API URL:', apiUrl);
      
      const response = await axios.put(apiUrl, {
        currentlyLive: true,
        delivered: false
      });

      if (response.data) {
        // Update local state
        const updatedLecture = { ...lecture, currentlyLive: true, delivered: false };
        setLectures(prev => prev.map(l => 
          l.id === lecture.id ? updatedLecture : l
        ));
        
        // Set as active live lecture and show chat
        setActiveLiveLecture(updatedLecture);
        setShowLiveChat(true);
        
        toast.success("Lecture started - now live!");
      }
    } catch (error) {
      console.error("❌ Error starting lecture:", error);
      console.error("❌ Error config:", error.config);
      console.error("❌ Attempted URL:", error.config?.url);
      toast.error(`Failed to start lecture: ${error.message}`);
    }
  };

  const handleMarkDelivered = async (lecture) => {
    if (!isAdmin) {
      toast.error("Only admins can mark lectures as delivered");
      return;
    }

    try {
      // FIXED URL: Removed extra /api/ part  
      const apiUrl = `${API_BASE_URL}/lectures/${lecture.id}`;
      console.log('🔥 MARK DELIVERED API URL:', apiUrl);
      
      const response = await axios.put(apiUrl, {
        delivered: !lecture.delivered,
        currentlyLive: false
      });

      if (response.data) {
        // Update local state
        const updatedLecture = { ...lecture, delivered: !lecture.delivered, currentlyLive: false };
        setLectures(prev => prev.map(l => 
          l.id === lecture.id ? updatedLecture : l
        ));
        
        // Clear active live lecture if this lecture was live
        if (activeLiveLecture?.id === lecture.id) {
          setActiveLiveLecture(null);
          setShowLiveChat(false);
        }
        
        toast.success(lecture.delivered ? "Lecture marked as not delivered" : "Lecture delivered successfully!");
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("Failed to update lecture status");
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Live Lectures</h2>
        <div className="text-sm text-gray-500">
          Course: {course.name}
        </div>
      </div>

      {/* Batch Tabs - Only show if admin or if there are multiple batches */}
      {availableBatches.length > 1 && (
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

      {/* Live Chat Panel */}
      {activeLiveLecture && (
        <div className="fixed bottom-4 right-4 z-50">
          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowLiveChat(!showLiveChat)}
            className={`mb-2 rounded-full p-4 text-white shadow-lg transition-all duration-200 ${
              showLiveChat 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700 animate-pulse'
            }`}
            title={showLiveChat ? "Hide Live Chat" : "Show Live Chat"}
          >
            <FaComments size={24} />
          </button>
          
          {/* Live Chat Window */}
          {showLiveChat && (
            <div className="w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-red-600 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-semibold text-sm">Live Chat - {activeLiveLecture.title}</span>
                </div>
                <button
                  onClick={() => setShowLiveChat(false)}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="h-80">
                <LiveChat 
                  lectureId={activeLiveLecture.id} 
                  isLive={true}
                  onClose={() => setShowLiveChat(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, videoUrl: "", lecture: null, isLive: false })}
        videoUrl={videoModal.videoUrl}
        lecture={videoModal.lecture}
        isLive={videoModal.isLive}
      />
    </div>
  );
};

export default LiveLectures;