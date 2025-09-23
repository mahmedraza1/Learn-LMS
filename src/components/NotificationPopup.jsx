import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdCampaign, MdNotifications } from 'react-icons/md';
import { useAppSelector } from '../store/hooks';
import { selectGlobalAnnouncements } from '../store/slices/announcementSlice';

const NotificationPopup = ({ isOpen, onClose, onAnnouncementClick, triggerRef }) => {
  const globalAnnouncements = useAppSelector(selectGlobalAnnouncements);
  const popupRef = useRef(null);
  const [preloadedAnnouncement, setPreloadedAnnouncement] = useState(null);

  // Handle clicking on a notification
  const handleNotificationClick = (announcement) => {
    onAnnouncementClick(announcement); // Call the parent handler
  };

  // Preload announcement on hover for faster opening
  const handleNotificationHover = (announcement) => {
    setPreloadedAnnouncement(announcement);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // Function to strip HTML tags for preview text
  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Extract title from HTML content if title is empty
  const getAnnouncementTitle = (announcement) => {
    if (announcement.title && announcement.title.trim()) {
      return announcement.title;
    }
    
    // Extract title from HTML content (look for h1, h2, h3 tags)
    const doc = new DOMParser().parseFromString(announcement.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
      return headings[0].textContent.trim();
    }
    
    // Fallback to truncated content
    const plainText = stripHtmlTags(announcement.content);
    return truncateText(plainText, 50);
  };

  return (
    <>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50" ref={popupRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {globalAnnouncements && globalAnnouncements.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {globalAnnouncements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(announcement)}
                onMouseEnter={() => handleNotificationHover(announcement)}
              >
                <div className="flex items-start space-x-3">
                  {/* Notification icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MdCampaign className="w-5 h-5 text-emerald-600" />
                  </div>
                  
                  {/* Notification content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {getAnnouncementTitle(announcement)}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(announcement.date || announcement.createdAt || announcement.updated_at)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {truncateText(stripHtmlTags(announcement.content), 80)}
                    </div>
                    {announcement.author && (
                      <div className="text-xs text-gray-500 mt-1">
                        By: {announcement.author}
                      </div>
                    )}
                    {announcement.priority && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        announcement.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : announcement.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.priority} priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdNotifications className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up! No new announcements at the moment.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {globalAnnouncements && globalAnnouncements.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            View all notifications
          </button>
        </div>
      )}
        </div>
      )}
    </>
  );
};

export default NotificationPopup;