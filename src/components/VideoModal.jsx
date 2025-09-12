import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  // Extract YouTube video ID from various URL formats
  const getYoutubeId = (url) => {
    if (!url) return null;
    
    try {
      // Handle different YouTube URL formats
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      // Format: https://youtu.be/VIDEO_ID
      // Format: https://www.youtube.com/embed/VIDEO_ID
      
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative h-[90vh] w-[90vw] max-w-7xl overflow-hidden rounded-lg bg-black">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        
        {/* Video embed */}
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-white">
            <p className="text-xl">Invalid or missing YouTube video URL</p>
            <p className="text-center text-sm text-gray-300">
              The lecture might not have a valid YouTube URL assigned yet. Please check back later or contact your instructor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
