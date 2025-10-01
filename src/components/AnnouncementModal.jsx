import React from "react";
import { MdClose } from "react-icons/md";
import { FaBullhorn } from "react-icons/fa";
import parse from "html-react-parser";

const AnnouncementModal = ({ isOpen, onClose, announcement }) => {
  if (!isOpen || !announcement) return null;

  // Optimized HTML content rendering with memoization
  const renderContent = React.useMemo(() => {
    try {
      // Make sure content is a string before parsing
      const contentStr = typeof announcement.content === 'string' 
        ? announcement.content 
        : String(announcement.content || '');
      
      // Simplified parsing options for better performance
      const options = {
        replace: (domNode) => {
          if (domNode.type === 'tag') {
            // Only add essential classes, avoid complex DOM manipulation
            const className = `announcement-${domNode.name}`;
            if (!domNode.attribs) domNode.attribs = {};
            domNode.attribs.className = className;
          }
          return undefined;
        }
      };
        
      // Parse HTML content with simplified options
      return parse(contentStr, options);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      // Fallback to dangerouslySetInnerHTML for speed
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: typeof announcement.content === 'string' 
              ? announcement.content 
              : String(announcement.content || '') 
          }} 
        />
      );
    }
  }, [announcement.content]);

  return (
    <>
      {/* Backdrop with blur effect and slight dark tint */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FaBullhorn className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Global Announcement</h2>
                <p className="text-sm text-gray-500">
                  By Learn pk • {new Date(announcement.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
              {/* Global announcement badge */}
              <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Global Announcement
              </div>
              
              {/* Title */}
              {announcement.title && announcement.title.trim() && (
                <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                  {announcement.title}
                </h3>
              )}
              
              {/* Content */}
              <div className="global-announcement-content prose prose-lg max-w-none text-gray-700">
                {renderContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementModal;