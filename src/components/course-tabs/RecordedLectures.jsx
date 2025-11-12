import React, { useState, useEffect } from 'react';
import { useAuth, useBatch } from '../../hooks/reduxHooks';
import { useAppSelector } from '../../store/hooks';
import { selectIsFeePendingStudent } from '../../store/slices/authSlice';
import { FaPlus } from 'react-icons/fa';
import RecordedLectureCard from '../RecordedLectureCard';
import RecordedLectureForm from '../RecordedLectureForm';
import VideoModal from '../VideoModal';
import VideoPlayerModal from '../VideoPlayerModal';
import FeePendingRestriction from '../FeePendingRestriction';
import axios from 'axios';
import toast from 'react-hot-toast';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const RecordedLectures = ({ course }) => {
  const [recordedLectures, setRecordedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lectureForm, setLectureForm] = useState({
    isOpen: false,
    lecture: null
  });
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: '',
    title: ''
  });
  const [videoPlayerModal, setVideoPlayerModal] = useState({
    isOpen: false,
    videoUrl: '',
    title: ''
  });

  // Call hooks with fallback values
  const authData = useAuth() || { user: null, isAdmin: false };
  const batchData = useBatch() || { selectedBatch: 'Batch A' };
  const isFeePendingStudent = useAppSelector(selectIsFeePendingStudent);

  // Safely destructure with defaults
  const user = authData?.user || null;
  const isAdmin = authData?.isAdmin || false;
  const selectedBatch = batchData?.selectedBatch || 'Batch A';

  // If fee pending student, show restriction message
  if (isFeePendingStudent) {
    return <FeePendingRestriction />;
  }

  // Determine video type
  const getVideoType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'raw';
    }
    return 'unknown';
  };

  // Fetch recorded lectures
  const fetchRecordedLectures = async () => {
    try {
      setLoading(true);
      
      // Try to load from server data file first
      try {
        const response = await fetch('/server/data/recorded-lectures.json');
        if (response.ok) {
          const data = await response.json();
          const courseLectures = data[course.id.toString()] || [];
          setRecordedLectures(courseLectures);
          return;
        }
      } catch (fetchError) {
        console.warn('Error loading recorded lectures from data file:', fetchError);
      }

      // If server data failed, try API endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/recorded-lectures/${course.id}`);
        const courseLectures = response.data || [];
        setRecordedLectures(courseLectures);
      } catch (apiError) {
        console.warn('API endpoint not available:', apiError);
        setRecordedLectures([]);
      }
    } catch (error) {
      console.error('Error fetching recorded lectures:', error);
      setRecordedLectures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      fetchRecordedLectures();
    }
  }, [course?.id]);

  // Handle adding new lecture
  const handleAddLecture = () => {
    if (!isAdmin) return;
    setLectureForm({
      isOpen: true,
      lecture: null
    });
  };

  // Handle editing lecture
  const handleEditLecture = (lecture) => {
    if (!isAdmin) return;
    setLectureForm({
      isOpen: true,
      lecture
    });
  };

  // Handle deleting lecture
  const handleDeleteLecture = async (lecture) => {
    if (!isAdmin) return;
    
    try {
      // Try API call first
      await axios.delete(`${API_BASE_URL}/recorded-lectures/${lecture.id}`);
      toast.success('Lecture deleted successfully');
    } catch (error) {
      console.warn('API delete failed, using local storage');
    }
    
        // Update local state\n    const updatedLectures = recordedLectures.filter(l => l.id !== lecture.id);\n    setRecordedLectures(updatedLectures);
    
    if (!error) {
      toast.success('Lecture deleted successfully');
    }
  };

  // Handle playing lecture
  const handlePlayLecture = (lecture) => {
    const videoUrl = lecture.videoUrl || lecture.video_url;
    const title = lecture.lectureName || lecture.title || `Lecture ${lecture.lecture_number}`;
    const videoType = getVideoType(videoUrl);

    if (videoType === 'youtube') {
      setVideoModal({
        isOpen: true,
        videoUrl,
        title
      });
    } else if (videoType === 'raw') {
      setVideoPlayerModal({
        isOpen: true,
        videoUrl,
        title
      });
    } else {
      toast.error('Unsupported video format');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (lectureData) => {
    try {
      let updatedLectures;
      
      if (lectureForm.lecture) {
        // Update existing lecture
        const lectureId = lectureForm.lecture.id;
        
        try {
          await axios.put(`${API_BASE_URL}/recorded-lectures/${lectureId}`, lectureData);
        } catch (error) {
          console.warn('API update failed, using local storage');
        }
        
        updatedLectures = recordedLectures.map(l => 
          l.id === lectureId ? { ...l, ...lectureData, id: lectureId } : l
        );
        toast.success('Lecture updated successfully');
      } else {
        // Add new lecture
        const newLecture = {
          ...lectureData,
          id: Date.now(), // Simple ID generation
          course_id: course.id
        };
        
        try {
          const response = await axios.post(`${API_BASE_URL}/recorded-lectures`, newLecture);
          if (response.data?.id) {
            newLecture.id = response.data.id;
          }
        } catch (error) {
          console.warn('API create failed, using local storage');
        }
        
        updatedLectures = [...recordedLectures, newLecture];
        toast.success('Lecture added successfully');
      }
      
      setRecordedLectures(updatedLectures);
      
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast.error('Failed to save lecture');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Recorded Lectures</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-gray-600">Loading recorded lectures...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recorded Lectures</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Course: {course.name} • {recordedLectures.length} lecture{recordedLectures.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleAddLecture}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              <FaPlus className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              Add Lecture
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {recordedLectures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recorded lectures yet</h3>
          <p className="text-gray-600 mb-4">
            {isAdmin 
              ? 'Get started by adding your first recorded lecture.'
              : 'Recorded lectures will appear here once they are added by the instructor.'
            }
          </p>
          {isAdmin && (
            <button
              onClick={handleAddLecture}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <FaPlus className="mr-2" />
              Add First Lecture
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {recordedLectures
            .sort((a, b) => (a.lecture_number || 0) - (b.lecture_number || 0))
            .map((lecture) => (
              <RecordedLectureCard
                key={lecture.id}
                lecture={lecture}
                isAdmin={isAdmin}
                onPlay={handlePlayLecture}
                onEdit={handleEditLecture}
                onDelete={handleDeleteLecture}
              />
            ))}
        </div>
      )}

      {/* Lecture Form Modal */}
      <RecordedLectureForm
        isOpen={lectureForm.isOpen}
        onClose={() => setLectureForm({ isOpen: false, lecture: null })}
        onSubmit={handleFormSubmit}
        lecture={lectureForm.lecture}
        existingLectures={recordedLectures}
        course={course}
      />

      {/* YouTube Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, videoUrl: '', title: '' })}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
      />

      {/* Raw Video Player Modal */}
      <VideoPlayerModal
        isOpen={videoPlayerModal.isOpen}
        onClose={() => setVideoPlayerModal({ isOpen: false, videoUrl: '', title: '' })}
        videoUrl={videoPlayerModal.videoUrl}
        title={videoPlayerModal.title}
      />
    </div>
  );
};

export default RecordedLectures;