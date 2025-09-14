import React from "react";
import { FaBullhorn, FaEdit, FaTrash } from "react-icons/fa";
import parse from "html-react-parser";

const Announcement = ({ announcement, isAdmin, onEdit, onDelete }) => {
  if (!announcement) return null;
  
  // Safely parse the HTML content with a fallback
  const renderContent = () => {
    try {
      // Make sure content is a string before parsing
      const contentStr = typeof announcement.content === 'string' 
        ? announcement.content 
        : String(announcement.content || '');
      
      // Parse options to preserve styling
      const options = {
        replace: (domNode) => {
          if (domNode.type === 'tag') {
            // Ensure all DOM nodes have the proper className
            if (!domNode.attribs) domNode.attribs = {};
            
            // Add specific classes for different elements
            if (domNode.name === 'h1') {
              domNode.attribs.className = 'announcement-h1';
            }
            if (domNode.name === 'h2') {
              domNode.attribs.className = 'announcement-h2';
            }
            if (domNode.name === 'ul') {
              domNode.attribs.className = 'announcement-ul';
            }
            if (domNode.name === 'ol') {
              domNode.attribs.className = 'announcement-ol';
            }
            if (domNode.name === 'li') {
              domNode.attribs.className = 'announcement-li';
            }
            if (domNode.name === 'blockquote') {
              domNode.attribs.className = 'announcement-blockquote';
            }
          }
          return undefined;
        }
      };
        
      // Parse HTML content with options
      return parse(contentStr, options);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return <p>{announcement.content || ""}</p>;
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <FaBullhorn className="mt-1 mr-3 text-amber-600 shrink-0" />
          <div className="flex-1">
            <div className="announcement-content">
              {renderContent()}
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(announcement)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit announcement"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(announcement)}
              className="text-red-600 hover:text-red-800"
              title="Delete announcement"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcement;
