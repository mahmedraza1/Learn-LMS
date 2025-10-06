import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaQuestionCircle, FaUser, FaTag } from 'react-icons/fa';

const FAQCard = ({ faq, onEdit, onDelete, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-800',
      'Technical': 'bg-green-100 text-green-800',
      'Software': 'bg-green-100 text-green-800',
      'Prerequisites': 'bg-yellow-100 text-yellow-800',
      'Duration': 'bg-purple-100 text-purple-800',
      'Concepts': 'bg-indigo-100 text-indigo-800',
      'Database': 'bg-red-100 text-red-800',
      'Assignment': 'bg-orange-100 text-orange-800',
      'Certification': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Question Header */}
      <div 
        className="p-3 sm:p-4 cursor-pointer flex items-start justify-between"
        onClick={toggleExpanded}
      >
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <FaQuestionCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 line-clamp-2 pr-2 sm:pr-4">
              {faq.question}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FaTag className="w-3 h-3" />
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                  {faq.category}
                </span>
              </div>
              
              {faq.createdBy && (
                <div className="flex items-center space-x-1">
                  <FaUser className="w-3 h-3" />
                  <span>{faq.createdBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(faq);
                }}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Edit FAQ"
              >
                <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(faq);
                }}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete FAQ"
              >
                <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}
          
          <div className="p-1.5 sm:p-2 text-gray-400">
            {isExpanded ? (
              <FaChevronUp className="w-4 h-4" />
            ) : (
              <FaChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Answer Section */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100">
          <div className="pt-3 sm:pt-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </p>
            </div>
            
            {/* Footer Info */}
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQCard;