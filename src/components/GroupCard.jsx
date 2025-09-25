import React from "react";
import { MdEdit, MdDelete, MdLaunch } from 'react-icons/md';

const GroupCard = ({ group, isAdmin = false, onEdit, onDelete, onJoin }) => {
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(group);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(group.id);
  };

  const handleJoin = (e) => {
    e.stopPropagation();
    // Open group link in new tab
    window.open(group.link, '_blank', 'noopener,noreferrer');
    if (onJoin) {
      onJoin(group);
    }
  };

  // Get platform color scheme
  const getPlatformColors = (platform) => {
    switch (platform.toLowerCase()) {
      case 'discord':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'telegram':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'slack':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'whatsapp':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'facebook':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'linkedin':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const platformColors = getPlatformColors(group.platform);

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="p-4">
        {/* Header with Platform and Admin Controls */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded ${platformColors.bg} ${platformColors.text}`}>
            {group.platform}
          </span>
          {isAdmin && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                title="Edit Group"
              >
                <MdEdit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 p-1 rounded"
                title="Delete Group"
              >
                <MdDelete className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Group Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {group.name}
        </h3>

        {/* Description */}
        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>Join Group</span>
          <MdLaunch className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GroupCard;