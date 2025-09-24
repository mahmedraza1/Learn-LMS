import React, { useState, useEffect } from "react";
import { MdPlayCircleOutline, MdFullscreen } from "react-icons/md";

const DashboardVideoSection = ({ isAdmin = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoConfig, setVideoConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchVideoConfig();
  }, [isAdmin]);
  
  const fetchVideoConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/dashboard-videos');
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const getVideoThumbnail = () => {
    if (videoConfig.videoType === 'youtube') {
      const youtubeId = extractYouTubeId(videoConfig.videoUrl);
      return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
    }
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
          <MdFullscreen className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
        
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {!isPlaying ? (
            <>
              <img
                src={getVideoThumbnail()}
                alt={videoConfig.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a generic video thumbnail
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <span>Click to play introduction video</span>
            </div>
            <button
              onClick={handlePlayVideo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <MdPlayCircleOutline className="w-4 h-4" />
              Play Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardVideoSection;