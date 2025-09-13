import React from "react";
import { FaBullhorn, FaEdit, FaTrash } from "react-icons/fa";

const Announcement = ({ announcement, isAdmin, onEdit, onDelete }) => {
  if (!announcement) return null;

  return (
    <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <FaBullhorn className="mt-1 mr-3 text-amber-600" />
          <div>
            <h3 className="font-medium text-amber-900">{announcement.title}</h3>
            <p className="mt-1 text-sm text-amber-800 whitespace-pre-wrap">{announcement.content}</p>
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
