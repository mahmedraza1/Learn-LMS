import React, { useState, useEffect } from 'react';
import { MdAdd, MdSearch } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAdmin } from '../store/slices/authSlice';
import { 
  selectCourses, 
  selectCoursesLoading, 
  selectCoursesError,
  fetchCourses,
  addCourse,
  updateCourse,
  deleteCourse
} from '../store/slices/coursesSlice';
import CourseCatalogCard from '../components/CourseCatalogCard';
import CourseForm from '../components/CourseForm';
import toast from 'react-hot-toast';

const Courses = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const courses = useAppSelector(selectCourses);
  const loading = useAppSelector(selectCoursesLoading);
  const error = useAppSelector(selectCoursesError);
  
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Handle add course
  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  // Handle edit course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast.success('Course deleted successfully');
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  // Handle form submission
  const handleCourseSubmit = async (courseData) => {
    try {
      if (editingCourse) {
        await dispatch(updateCourse({
          id: editingCourse.id,
          courseData
        })).unwrap();
        toast.success('Course updated successfully');
      } else {
        await dispatch(addCourse(courseData)).unwrap();
        toast.success('Course added successfully');
      }
    } catch (error) {
      toast.error(`Failed to ${editingCourse ? 'update' : 'add'} course`);
    }
  };

  // Close form
  const closeCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  // Filter courses based on search and level
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Courses</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                {isAdmin ? 'Manage and organize all courses' : 'Explore available courses'}
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddCourse}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Beginner to Advanced">Beginner to Advanced</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error loading courses: {error}</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdSearch className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || levelFilter !== 'All' ? 'No courses found' : 'No courses available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || levelFilter !== 'All' 
                    ? 'Try adjusting your search or filters.'
                    : isAdmin 
                      ? 'Get started by adding your first course.'
                      : 'New courses will appear here soon.'
                  }
                </p>
                {isAdmin && !searchTerm && levelFilter === 'All' && (
                  <button
                    onClick={handleAddCourse}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Your First Course
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCourses.map((course) => (
                  <CourseCatalogCard
                    key={course.id}
                    course={course}
                    isAdmin={isAdmin}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}

            {/* Course Count */}
            {filteredCourses.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Form Modal */}
      <CourseForm
        isOpen={showCourseForm}
        onClose={closeCourseForm}
        onSubmit={handleCourseSubmit}
        course={editingCourse}
      />
    </div>
  );
};

export default Courses;