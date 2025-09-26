import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaYoutube, FaVideo } from 'react-icons/fa';

const RecordedLectureForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  lecture = null, 
  existingLectures = [],
  course = null 
}) => {
  const [formData, setFormData] = useState({
    lectureName: '',
    thumbnailUrl: '',
    videoUrl: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate next lecture number
  const getNextLectureNumber = () => {
    if (existingLectures.length === 0) return 1;
    const maxNumber = Math.max(...existingLectures.map(l => l.lecture_number || 0));
    return maxNumber + 1;
  };

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (lecture) {
        // Editing existing lecture
        setFormData({
          lectureName: lecture.title || lecture.lectureName || '',
          thumbnailUrl: lecture.thumbnail || lecture.thumbnailUrl || '',
          videoUrl: lecture.videoUrl || lecture.video_url || '',
          description: lecture.description || ''
        });
      } else {
        // Adding new lecture
        setFormData({
          lectureName: '',
          thumbnailUrl: '',
          videoUrl: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, lecture]);

  // Detect video type (YouTube or raw video)
  const detectVideoType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    // Check for common video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'raw';
    }
    return 'unknown';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lectureName.trim()) {
      newErrors.lectureName = 'Lecture name is required';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL is required';
    } else {
      // Basic URL validation
      try {
        new URL(formData.videoUrl);
      } catch {
        newErrors.videoUrl = 'Please enter a valid URL';
      }
    }

    if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
      try {
        new URL(formData.thumbnailUrl);
      } catch {
        newErrors.thumbnailUrl = 'Please enter a valid thumbnail URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const lectureData = {
        ...formData,
        lecture_number: lecture ? lecture.lecture_number : getNextLectureNumber(),
        video_type: detectVideoType(formData.videoUrl),
        course_id: course?.id,
        created_at: lecture ? lecture.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSubmit(lectureData);
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save lecture. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const videoType = detectVideoType(formData.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {lecture ? 'Edit Recorded Lecture' : 'Add New Recorded Lecture'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Info */}
          {course && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Course: {course.name}</h3>
              <p className="text-sm text-gray-600">
                Lecture #{lecture ? lecture.lecture_number : getNextLectureNumber()}
              </p>
            </div>
          )}

          {/* Lecture Name */}
          <div>
            <label htmlFor="lectureName" className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Name *
            </label>
            <input
              type="text"
              id="lectureName"
              name="lectureName"
              value={formData.lectureName}
              onChange={handleInputChange}
              placeholder="Enter lecture name..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.lectureName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.lectureName && (
              <p className="mt-1 text-sm text-red-600">{errors.lectureName}</p>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Video URL *
            </label>
            <div className="relative">
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="Enter YouTube URL or direct video file URL..."
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-2.5">
                {videoType === 'youtube' && <FaYoutube className="text-red-500" />}
                {videoType === 'raw' && <FaVideo className="text-blue-500" />}
              </div>
            </div>
            {videoType !== 'unknown' && formData.videoUrl && (
              <p className="mt-1 text-xs text-gray-500">
                Detected: {videoType === 'youtube' ? 'YouTube Video' : 'Raw Video File'}
              </p>
            )}
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.videoUrl}</p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleInputChange}
              placeholder="Enter thumbnail image URL..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.thumbnailUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.thumbnailUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.thumbnailUrl}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from video (YouTube videos only)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter lecture description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  {lecture ? 'Update Lecture' : 'Add Lecture'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordedLectureForm;