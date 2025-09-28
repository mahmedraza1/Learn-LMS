import React from 'react';
import { FaDownload, FaExternalLinkAlt, FaEdit, FaTrash, FaFileAlt, FaImage, FaFile, FaCalendar, FaUser } from 'react-icons/fa';

const NotesCard = ({ note, onEdit, onDelete, onView, onDownload, isAdmin }) => {
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFileAlt className="w-6 h-6 text-red-500" />;
      case 'image':
        return <FaImage className="w-6 h-6 text-green-500" />;
      default:
        return <FaFile className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = () => {
    if (note.fileUrl) {
      window.open(note.fileUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (note.fileUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = note.fileUrl;
      link.download = note.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              {getFileIcon(note.fileType)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 line-clamp-2 break-words">
              {note.fileName}
            </h3>
            {note.description && (
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                {note.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              <div className="flex items-center space-x-1">
                <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{note.uploadDate}</span>
              </div>
              {note.uploadedBy && (
                <div className="flex items-center space-x-1 min-w-0">
                  <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{note.uploadedBy}</span>
                </div>
              )}
              {note.fileSize && (
                <span className="text-gray-400 hidden sm:inline">•</span>
              )}
              {note.fileSize && (
                <span className="truncate">{note.fileSize}</span>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(note.fileType)}`}>
                {note.fileType.toUpperCase()}
              </span>
              {note.tags && note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Edit Note"
            >
              <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onDelete(note)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Note"
            >
              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleView}
            className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
          >
            <FaExternalLinkAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            View
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FaDownload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Download
          </button>
        </div>

        {note.views !== undefined && (
          <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            {note.views} views
          </span>
        )}
      </div>
    </div>
  );
};

export default NotesCard;