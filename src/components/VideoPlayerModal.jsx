import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title = "Video Player" }) => {
  const modalRef = useRef(null);
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
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl mx-4 bg-white rounded-lg shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Video Content */}
        <div className="p-4">
          {videoUrl ? (
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                className="w-full h-full rounded-lg"
                controls
                controlsList="nodownload"
                onError={(e) => {
                  console.error("Video loading error:", e);
                }}
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-2">🎥</div>
                <p className="text-gray-600">No video URL provided</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with video info */}
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500">
            Video URL: {videoUrl || 'Not provided'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;