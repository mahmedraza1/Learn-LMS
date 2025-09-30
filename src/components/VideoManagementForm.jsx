import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose, MdSave, MdVideoLibrary, MdLink, MdImage } from "react-icons/md";
import toast from "react-hot-toast";

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const VideoManagementForm = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  
  const videoType = watch('videoType', 'youtube');
  
  useEffect(() => {
    if (isOpen) {
      fetchVideoData();
    }
  }, [isOpen]);
  
  const fetchVideoData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-videos`);
      const data = await response.json();
      setVideoData(data);
      
      // Set form values
      if (data) {
        reset({
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          videoType: data.videoType,
          customThumbnail: data.customThumbnail || '',
          isActive: data.isActive
        });
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to load video configuration');
    }
  };
  
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let processedVideoUrl = data.videoUrl;
      
      // Process YouTube URLs
      if (data.videoType === 'youtube') {
        const youtubeId = extractYouTubeId(data.videoUrl);
        if (youtubeId) {
          processedVideoUrl = `https://youtu.be/${youtubeId}`;
        } else {
          toast.error('Invalid YouTube URL');
          setLoading(false);
          return;
        }
      }
      
      const payload = {
        ...data,
        videoUrl: processedVideoUrl,
        updatedBy: user?.name || 'Admin'
      };
      
      const response = await fetch(`${API_BASE_URL}/dashboard-videos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast.success('Dashboard video updated successfully');
        fetchVideoData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdVideoLibrary className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Manage Dashboard Video</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Video Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter video title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            {/* Video Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter video description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            {/* Video Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Type
              </label>
              <select
                {...register('videoType', { required: 'Video type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="youtube">YouTube Link</option>
                <option value="embed">Embed Code</option>
                <option value="direct">Direct Video URL</option>
              </select>
            </div>
            
            {/* Video URL/Embed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {videoType === 'youtube' ? 'YouTube URL' : 
                 videoType === 'embed' ? 'Embed Code' : 'Direct Video URL'}
              </label>
              {videoType === 'embed' ? (
                <textarea
                  {...register('videoUrl', { required: 'Video URL/embed is required' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="Paste embed code here (e.g., <iframe src='...'></iframe>)"
                />
              ) : (
                <input
                  type="url"
                  {...register('videoUrl', { required: 'Video URL is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={
                    videoType === 'youtube' 
                      ? "https://youtu.be/... or https://youtube.com/watch?v=..."
                      : "https://example.com/video.mp4"
                  }
                />
              )}
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
              )}
            </div>
            
            {/* Custom Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Thumbnail URL (Optional)
              </label>
              <input
                type="url"
                {...register('customThumbnail')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://example.com/thumbnail.jpg (Leave empty to use auto-generated thumbnail)"
              />
              <p className="mt-1 text-xs text-gray-500">
                If provided, this will override the auto-generated thumbnail. For YouTube videos, leave empty to use YouTube's thumbnail.
              </p>
              
              {/* Thumbnail Preview */}
              {watch('customThumbnail') && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Preview
                  </label>
                  <div className="relative w-full max-w-xs">
                    <img
                      src={watch('customThumbnail')}
                      alt="Thumbnail preview"
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const errorMsg = e.target.nextElementSibling;
                        if (errorMsg) errorMsg.style.display = 'block';
                      }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                        const errorMsg = e.target.nextElementSibling;
                        if (errorMsg) errorMsg.style.display = 'none';
                      }}
                    />
                    <div 
                      className="text-xs text-red-600 mt-1" 
                      style={{ display: 'none' }}
                    >
                      Invalid thumbnail URL or failed to load image
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Show this video on dashboard
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <MdSave className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoManagementForm;