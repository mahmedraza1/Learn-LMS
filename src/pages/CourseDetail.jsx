import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCourses, fetchCourses } from '../store/slices/coursesSlice';
import { MdPeople, MdSchedule, MdStar, MdGroup } from 'react-icons/md';

// Tab Components
import Overview from '../components/course-tabs/Overview';
import RecordedLectures from '../components/course-tabs/RecordedLectures';
import LiveLectures from '../components/course-tabs/LiveLectures';
import Notes from '../components/course-tabs/Notes';
import AnnouncementsNews from '../components/course-tabs/AnnouncementsNews';
import QNA from '../components/course-tabs/QNA';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the current course
  const course = courses.find(c => c.id === parseInt(courseId));

  useEffect(() => {
    // Fetch courses if not already loaded
    if (courses.length === 0) {
      dispatch(fetchCourses());
    }
  }, [dispatch, courses.length]);

  // Handle join community button click
  const handleJoinCommunity = () => {
    navigate('/groups');
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', component: Overview },
    { id: 'recorded', label: 'Recorded Lectures', component: RecordedLectures },
    { id: 'live', label: 'Live Lectures', component: LiveLectures },
    { id: 'notes', label: 'Notes', component: Notes },
    { id: 'announcements', label: 'Announcements and News', component: AnnouncementsNews },
    { id: 'qna', label: 'QNA', component: QNA }
  ];

  // Loading state
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Get active tab component
  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || Overview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Course Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-64 h-36 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={course.thumbnail}
                  alt={course.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
                  }}
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1">
              {/* Course Name */}
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{course.name}</h1>
              
              {/* Course Metadata */}
              <div className="flex items-center space-x-6 text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <MdPeople className="w-4 h-4" />
                  <span className="text-sm">{course.enrolledStudents} Students</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MdSchedule className="w-4 h-4" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                
                {course.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <MdStar className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{course.rating}</span>
                    <span className="text-gray-500 text-sm">({course.totalRatings} reviews)</span>
                  </div>
                )}
              </div>

              {/* Course Tag Line */}
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                {course.description}
              </p>

              {/* Course Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {course.tags.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                      +{course.tags.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Join Community Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleJoinCommunity}
                className="bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md"
              >
                <MdGroup className="w-5 h-5" />
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        <ActiveTabComponent course={course} />
      </div>
    </div>
  );
};

export default CourseDetail;