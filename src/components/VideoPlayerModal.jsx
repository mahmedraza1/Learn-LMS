import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title = "Video Player" }) => {
  const videoRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  // Handle right-click disable
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        className="relative h-screen w-screen overflow-hidden bg-black"
        onContextMenu={handleContextMenu}
      >
        {/* Close button */}
        <button
          className="absolute right-6 top-6 z-20 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm hover:bg-black/80 transition-all duration-200 border-2 border-white/20"
          onClick={onClose}
          onContextMenu={handleContextMenu}
        >
          <FaTimes size={28} />
        </button>

        {/* Video Content */}
        {videoUrl ? (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            controlsList="nodownload"
            onContextMenu={handleContextMenu}
            onError={(e) => {
              console.error("Video loading error:", e);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div 
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-white"
            onContextMenu={handleContextMenu}
          >
            <div className="text-white text-6xl mb-4">🎥</div>
            <p className="text-xl">No video available</p>
            <p className="text-center text-sm text-gray-300">
              The video might not be uploaded yet. Please check back later or contact your instructor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerModal;