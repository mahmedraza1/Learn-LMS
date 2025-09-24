import React from "react";
import { MdPeople, MdSchedule, MdStar, MdEdit, MdDelete } from "react-icons/md";

const CourseCatalogCard = ({ course, isAdmin = false, onEdit, onDelete }) => {
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(course);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(course.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Course Thumbnail */}
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'; // Fallback image
          }}
        />
        
        {/* Admin Controls Overlay */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleEdit}
              className="bg-white/90 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow-md transition-colors"
              title="Edit Course"
            >
              <MdEdit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="bg-white/90 hover:bg-red-100 text-red-600 p-2 rounded-full shadow-md transition-colors"
              title="Delete Course"
            >
              <MdDelete className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Level Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {course.level}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.name}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-2">
          By <span className="font-medium">{course.instructor}</span>
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Enrolled Students */}
            <div className="flex items-center space-x-1">
              <MdPeople className="w-4 h-4" />
              <span>{course.enrolledStudents}</span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center space-x-1">
              <MdSchedule className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            
            {/* Rating */}
            {course.rating > 0 && (
              <div className="flex items-center space-x-1">
                <MdStar className="w-4 h-4 text-yellow-500" />
                <span>{course.rating}</span>
                <span className="text-gray-400">({course.totalRatings})</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{course.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        {!isAdmin && (
          <div className="flex justify-center">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors w-full">
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalogCard;