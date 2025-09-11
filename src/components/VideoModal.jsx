import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  // Extract YouTube video ID from URL
  const getYoutubeId = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    } catch (err) {
      console.error("Invalid URL", err);
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
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
            <p>Invalid video URL</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
