import React, { useState, useEffect } from "react";
import { MdPlayCircleOutline, MdFullscreen, MdEdit, MdImage } from "react-icons/md";
import toast from 'react-hot-toast';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const DashboardVideoSection = ({ isAdmin = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoConfig, setVideoConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showThumbnailEdit, setShowThumbnailEdit] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState('');
  
  useEffect(() => {
    fetchVideoConfig();
  }, [isAdmin]);
  
  const fetchVideoConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-videos`);
      const data = await response.json();
      
      if (data && data.isActive) {
        setVideoConfig(data);
      } else {
        // Fallback to default configuration
        setVideoConfig({
          title: "Welcome to Learn-Live Platform",
          description: "Get started with your learning journey. This introduction video will help you navigate the platform and make the most of your courses.",
          videoUrl: "https://youtu.be/jfKfPfyJRdk",
          videoType: "youtube"
        });
      }
    } catch (error) {
      console.error('Error fetching video config:', error);
      // Use fallback configuration
      setVideoConfig({
        title: "Welcome to Learn-Live Platform",
        description: "Get started with your learning journey.",
        videoUrl: "https://youtu.be/jfKfPfyJRdk",
        videoType: "youtube"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/user\/[^\/]+#p\/u\/\d+\/([^&\n?#]+)/,
      /youtube\.com\/ytscreeningroom\?v=([^&\n?#]+)/,
      /youtube\.com\/sandalsResorts#p\/c\/[A-Z0-9]+\/\d+\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    
    return null;
  };
  
  const getVideoThumbnail = () => {
    // Priority: Custom thumbnail > YouTube auto-generated thumbnail > Default
    if (videoConfig.customThumbnail) {
      return videoConfig.customThumbnail;
    }
    
    // Auto-generate YouTube thumbnail if it's a YouTube video
    if (videoConfig.videoType === 'youtube' || videoConfig.videoUrl?.includes('youtube.com') || videoConfig.videoUrl?.includes('youtu.be')) {
      const youtubeId = extractYouTubeId(videoConfig.videoUrl);
      if (youtubeId) {
        // Try different YouTube thumbnail qualities in order of preference
        // sddefault is more reliable than maxresdefault for most videos
        return `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`;
      }
    }
    
    // Default fallback thumbnail
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
  };
  
  const getEmbedUrl = () => {
    if (videoConfig.videoType === 'youtube') {
      const youtubeId = extractYouTubeId(videoConfig.videoUrl);
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1` : null;
    } else if (videoConfig.videoType === 'direct') {
      return videoConfig.videoUrl;
    }
    return null;
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  const handleThumbnailEdit = () => {
    setShowThumbnailEdit(true);
    setCustomThumbnail(videoConfig.customThumbnail || '');
  };

  const handleThumbnailSave = async () => {
    try {
      const updatedConfig = {
        ...videoConfig,
        customThumbnail: customThumbnail
      };
      
      // Save to backend
      const response = await fetch(`${API_BASE_URL}/dashboard-videos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: videoConfig.title,
          description: videoConfig.description,
          videoUrl: videoConfig.videoUrl,
          videoType: videoConfig.videoType,
          customThumbnail: customThumbnail,
          isActive: videoConfig.isActive,
          updatedBy: 'Learn.pk'
        }),
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setVideoConfig(updatedData);
        setShowThumbnailEdit(false);
        toast.success('Thumbnail updated successfully!');
      } else {
        console.error('Failed to update thumbnail');
        toast.error('Failed to update thumbnail. Please try again.');
      }
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      toast.error('Error updating thumbnail. Please try again.');
    }
  };

  const handleThumbnailCancel = () => {
    setShowThumbnailEdit(false);
    setCustomThumbnail('');
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!videoConfig) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{videoConfig.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{videoConfig.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleThumbnailEdit}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Edit Thumbnail"
              >
                <MdImage className="w-5 h-5" />
              </button>
            )}
            <MdFullscreen className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
        </div>
        
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {!isPlaying ? (
            <>
              <img
                src={getVideoThumbnail()}
                alt={videoConfig.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorMsg = e.target.nextElementSibling;
                  if (errorMsg) errorMsg.style.display = 'block';
                  
                  // For YouTube videos, try fallback thumbnails
                  if ((videoConfig.videoType === 'youtube' || videoConfig.videoUrl?.includes('youtube.com') || videoConfig.videoUrl?.includes('youtu.be')) && !videoConfig.customThumbnail) {
                    const youtubeId = extractYouTubeId(videoConfig.videoUrl);
                    if (youtubeId) {
                      // Try different thumbnail qualities as fallbacks
                      if (e.target.src.includes('sddefault')) {
                        // If sddefault fails, try mqdefault
                        e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                        return;
                      } else if (e.target.src.includes('mqdefault')) {
                        // If mqdefault fails, try hqdefault
                        e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                        return;
                      } else if (e.target.src.includes('hqdefault')) {
                        // If hqdefault fails, try default
                        e.target.src = `https://img.youtube.com/vi/${youtubeId}/default.jpg`;
                        return;
                      }
                    }
                  }
                  
                  // Final fallback to generic video thumbnail
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
                }}
              />
              <div style={{display: 'none'}} className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-600 font-semibold text-center">
                Thumbnail failed to load. Please check the URL or video privacy settings.
              </div>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={handlePlayVideo}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-4 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <MdPlayCircleOutline className="w-12 h-12" />
                </button>
              </div>
            </>
          ) : (
            <>
              {videoConfig.videoType === 'embed' ? (
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: videoConfig.videoUrl }}
                />
              ) : videoConfig.videoType === 'direct' ? (
                <video
                  src={videoConfig.videoUrl}
                  title={videoConfig.title}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              ) : (
                <iframe
                  src={getEmbedUrl()}
                  title={videoConfig.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </>
          )}
        </div>
        
        {!isPlaying && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handlePlayVideo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <MdPlayCircleOutline className="w-5 h-5" />
              Play Video
            </button>
          </div>
        )}
        
        {/* Admin Thumbnail Edit Modal */}
        {isAdmin && showThumbnailEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Thumbnail</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={customThumbnail}
                  onChange={(e) => setCustomThumbnail(e.target.value)}
                  placeholder="Enter thumbnail URL (leave empty to use auto-generated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to use auto-generated YouTube thumbnail or default thumbnail
                </p>
              </div>
              {customThumbnail && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={customThumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleThumbnailCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                {customThumbnail && (
                  <button
                    onClick={() => setCustomThumbnail('')}
                    className="px-4 py-2 text-orange-600 hover:text-orange-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleThumbnailSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardVideoSection;