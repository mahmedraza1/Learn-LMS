import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import LiveChat from "./LiveChat";

const VideoModal = ({ isOpen, onClose, videoUrl, lecture = null, isLive = false }) => {
  
  // Debug logging
  console.log('VideoModal props:', { isOpen, lecture: lecture?.title, isLive });
  
  // Extract YouTube video ID from various URL formats
  const getYoutubeId = (url) => {
    if (!url) return null;
    
    try {
      // Handle different YouTube URL formats
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      // Format: https://youtu.be/VIDEO_ID
      // Format: https://www.youtube.com/embed/VIDEO_ID
      // Format: https://youtube.com/live/VIDEO_ID
      
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        // Short URL format: https://youtu.be/VIDEO_ID
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/watch')) {
        // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        // Embed URL: https://www.youtube.com/embed/VIDEO_ID
        const parts = url.split('embed/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/live/')) {
        // Live URL format: https://youtube.com/live/VIDEO_ID
        const parts = url.split('live/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0];
        }
      }
      
      return videoId;
    } catch (err) {
      console.error("Error extracting YouTube ID:", err);
      return null;
    }
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const videoId = getYoutubeId(videoUrl);

  // Handle right-click disable
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        className="relative h-screen w-screen overflow-hidden bg-black flex"
        onContextMenu={handleContextMenu}
      >
        {/* Video Section */}
        <div className={`relative transition-all duration-300 ${isLive && lecture ? 'w-3/4' : 'w-full'}`}>
          {/* Close button */}
          <button
            className="absolute right-6 top-6 z-20 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm hover:bg-black/80 transition-all duration-200 border-2 border-white/20"
            onClick={onClose}
            onContextMenu={handleContextMenu}
          >
            <FaTimes size={28} />
          </button>
          
          {/* Live indicator for live lectures */}
          {isLive && lecture && (
            <div className="absolute left-6 top-6 z-20 flex items-center space-x-2 rounded-full bg-red-600 px-4 py-2 text-white backdrop-blur-sm border-2 border-white/20">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm">🔴 LIVE</span>
            </div>
          )}
          
          {/* Video embed */}
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&fs=0&cc_load_policy=0&iv_load_policy=3&disablekb=1&loop=0&playlist=${videoId}&start=0&end=0&enablejsapi=0&origin=${window.location.origin}&title=0&byline=0&portrait=0&color=ffffff&autopause=0&muted=0&playsinline=1&dnt=1&widget_referrer=${window.location.origin}`}
              title="YouTube video player"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              className="h-full w-full border-0"
              onContextMenu={handleContextMenu}
              style={{ pointerEvents: 'auto' }}
            ></iframe>
          ) : (
            <div 
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-white"
              onContextMenu={handleContextMenu}
            >
              <p className="text-xl">Invalid or missing YouTube video URL</p>
              <p className="text-center text-sm text-gray-300">
                The lecture might not have a valid YouTube URL assigned yet. Please check back later or contact your instructor.
              </p>
            </div>
          )}
        </div>
        
        {/* Live Chat Section - Always visible for live lectures */}
        {isLive && lecture && (
          <div className="w-1/4 min-w-80 bg-white flex flex-col border-l-2 border-gray-200">
            <LiveChat 
              lectureId={lecture.id} 
              isLive={isLive}
              onClose={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
