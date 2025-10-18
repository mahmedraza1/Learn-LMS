import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import LiveChat from "./LiveChat";

const VideoModal = ({ isOpen, onClose, videoUrl, lecture = null, isLive = false }) => {
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Debug logging
  console.log('VideoModal props:', { isOpen, lecture: lecture?.title, isLive });
  
  // Detect landscape orientation on mobile
  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile and in landscape mode
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isMobile && isLandscapeMode);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
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
      // Add class to hide mobile navigation
      document.body.classList.add("video-modal-active");
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "auto";
      // Remove class to show mobile navigation
      document.body.classList.remove("video-modal-active");
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
      {/* Close button - Outside all containers for portrait mode */}
      <button
        className="fixed right-4 top-4 lg:right-6 lg:top-6 z-[99999] rounded-full bg-[#DC2626] p-3 lg:p-3 text-white hover:bg-[#B91C1C] shadow-2xl border-2 border-white/30 active:scale-95"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Close button clicked');
          onClose();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Close button touched');
          onClose();
        }}
        onContextMenu={handleContextMenu}
        type="button"
        style={{ 
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }}
      >
        <FaTimes size={24} className="lg:w-7 lg:h-7" style={{ pointerEvents: 'none' }} />
      </button>

      <div 
        className={`relative h-screen w-screen overflow-hidden bg-black ${
          isLive && lecture 
            ? (isLandscape ? 'flex flex-row' : 'flex flex-col lg:flex-row')
            : 'flex'
        }`}
        onContextMenu={handleContextMenu}
      >
        {/* Video Section */}
        <div className={`relative transition-all duration-300 ${
          isLive && lecture 
            ? (isLandscape 
                ? 'w-3/4 h-full' 
                : 'w-full lg:w-3/4 h-[40vh] lg:h-full'
              )
            : 'w-full h-full'
        }`}>
          
          {/* Live indicator for live lectures */}
          {isLive && lecture && (
            <div className="absolute left-4 top-4 lg:left-6 lg:top-6 z-20 flex items-center space-x-2 rounded-full bg-red-600 px-3 py-1.5 lg:px-4 lg:py-2 text-white backdrop-blur-sm border-2 border-white/20">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold text-xs lg:text-sm">🔴 LIVE</span>
            </div>
          )}
          
          {/* Video embed */}
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3&disablekb=0&loop=0&playlist=${videoId}&start=0&end=0&enablejsapi=0&origin=${window.location.origin}&title=0&byline=0&portrait=0&color=ffffff&autopause=0&muted=0&playsinline=1&dnt=1&widget_referrer=${window.location.origin}`}
              title="YouTube video player"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen={true}
              className="h-full w-full border-0"
              onContextMenu={handleContextMenu}
              style={{ pointerEvents: 'auto' }}
            ></iframe>
          ) : (
            <div 
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-900 p-4 lg:p-8 text-white"
              onContextMenu={handleContextMenu}
            >
              <p className="text-lg lg:text-xl">Invalid or missing YouTube video URL</p>
              <p className="text-center text-xs lg:text-sm text-gray-300">
                The lecture might not have a valid YouTube URL assigned yet. Please check back later or contact your instructor.
              </p>
            </div>
          )}
        </div>
        
        {/* Live Chat Section - Responsive: Below video on mobile portrait, beside on landscape/desktop */}
        {isLive && lecture && (
          <div className={`bg-white flex flex-col border-gray-200 overflow-hidden ${
            isLandscape 
              ? 'w-1/4 min-w-80 h-full border-l-2' 
              : 'w-full lg:w-1/4 lg:min-w-80 flex-1 lg:h-full border-t-2 lg:border-t-0 lg:border-l-2'
          }`}>
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
