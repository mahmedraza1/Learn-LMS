import React from "react";
import { FaBullhorn, FaEdit, FaTrash } from "react-icons/fa";
import parse from "html-react-parser";

const AdminGlobalAnnouncement = ({ announcement, onEdit, onDelete }) => {
  if (!announcement) return null;
  
  // Safely parse the HTML content with a fallback
  const renderContent = () => {
    try {
      // Make sure content is a string before parsing
      const contentStr = typeof announcement.content === 'string' 
        ? announcement.content 
        : String(announcement.content || '');
      
      // Parse options to preserve styling with green theme classes
      const options = {
        replace: (domNode) => {
          if (domNode.type === 'tag') {
            // Ensure all DOM nodes have the proper className
            if (!domNode.attribs) domNode.attribs = {};
            
            // Add specific classes for different elements with green theme
            if (domNode.name === 'h1') {
              domNode.attribs.className = 'global-announcement-h1';
            }
            if (domNode.name === 'h2') {
              domNode.attribs.className = 'global-announcement-h2';
            }
            if (domNode.name === 'h3') {
              domNode.attribs.className = 'global-announcement-h3';
            }
            if (domNode.name === 'ul') {
              domNode.attribs.className = 'global-announcement-ul';
            }
            if (domNode.name === 'ol') {
              domNode.attribs.className = 'global-announcement-ol';
            }
            if (domNode.name === 'li') {
              domNode.attribs.className = 'global-announcement-li';
            }
            if (domNode.name === 'blockquote') {
              domNode.attribs.className = 'global-announcement-blockquote';
            }
          }
          return undefined;
        }
      };
        
      // Parse HTML content with options
      return parse(contentStr, options);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return <p>Error displaying announcement content</p>;
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <FaBullhorn className="h-5 w-5 text-green-600" />
        </div>
        
        <div className="min-w-0 flex-1">
          {/* Global announcement badge */}
          <div className="mb-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Global Announcement
          </div>
          
          {/* Title */}
          {announcement.title && (
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {announcement.title}
            </h3>
          )}
          
          {/* Content */}
          <div className="global-announcement-content prose prose-sm max-w-none text-gray-700">
            {renderContent()}
          </div>
          
          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-green-200 pt-3 text-xs text-gray-600">
            <span>
              By: <span className="font-medium">{announcement.author || 'Admin'}</span>
            </span>
            <span>
              {new Date(announcement.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(announcement)}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            title="Edit announcement"
          >
            <FaEdit className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(announcement.id)}
            className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            title="Delete announcement"
          >
            <FaTrash className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalAnnouncement;