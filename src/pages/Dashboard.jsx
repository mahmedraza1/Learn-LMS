import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaBullhorn, FaEdit, FaTrash } from 'react-icons/fa';
import { MdClose, MdAdd } from 'react-icons/md';
import parse from 'html-react-parser';
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin } from "../store/slices/authSlice";
import DashboardStats from '../components/DashboardStats';
import DashboardVideoSection from '../components/DashboardVideoSection';
import VideoManagementForm from '../components/VideoManagementForm';
import RTE from '../components/RTE';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [videoManagementOpen, setVideoManagementOpen] = useState(false);
  const [dashboardAnnouncement, setDashboardAnnouncement] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // React Hook Form setup for dashboard announcement
  const { control, handleSubmit, reset, register, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      author: user?.name || 'Admin'
    }
  });

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return { greeting: "Good Morning", emoji: "🌅" };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: "Good Afternoon", emoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: "Good Evening", emoji: "🌇" };
    } else {
      return { greeting: "Good Night", emoji: "🌙" };
    }
  };

  const { greeting, emoji } = getTimeBasedGreeting();

  // Determine API URL based on hostname
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
      return 'https://lms.learn.pk/api';
    }
    return 'http://localhost:3001/api';
  };

  const API_BASE_URL = getApiBaseUrl();

  // Fetch dashboard announcement
  const fetchDashboardAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`);
      if (response.ok) {
        const data = await response.json();
        setDashboardAnnouncement(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save dashboard announcement
  const saveDashboardAnnouncement = async (data) => {
    try {
      setLoading(true);
      const announcementData = {
        ...data,
        id: dashboardAnnouncement?.id || Date.now(),
        date: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const savedAnnouncement = await response.json();
        setDashboardAnnouncement(savedAnnouncement);
        toast.success('Dashboard announcement saved successfully!');
        setShowAnnouncementForm(false);
        reset();
      } else {
        toast.error('Failed to save dashboard announcement');
      }
    } catch (error) {
      console.error('Error saving dashboard announcement:', error);
      toast.error('Error saving dashboard announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete dashboard announcement
  const deleteDashboardAnnouncement = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDashboardAnnouncement(null);
        toast.success('Dashboard announcement deleted successfully!');
      } else {
        toast.error('Failed to delete dashboard announcement');
      }
    } catch (error) {
      console.error('Error deleting dashboard announcement:', error);
      toast.error('Error deleting dashboard announcement');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard announcement on component mount
  useEffect(() => {
    fetchDashboardAnnouncement();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {isAdmin ? 'Admin Dashboard' : 'Learn LMS'}
              </h1>
              <p className="mt-1 text-sm sm:text-base lg:text-lg text-gray-600 truncate">
                {greeting}, {user?.name || 'User'}! {emoji}
              </p>
            </div>
            {!isAdmin && user?.batch && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 sm:px-4 py-1 sm:py-2 text-sm font-medium text-emerald-800">
                  {user.batch}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Dashboard Statistics */}
        <DashboardStats user={user} isAdmin={isAdmin} />
        
        {/* Dashboard Announcement Section */}
        {(dashboardAnnouncement || isAdmin) && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <FaBullhorn className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Dashboard Announcement</h2>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    {dashboardAnnouncement && (
                      <button
                        onClick={() => {
                          reset({
                            title: dashboardAnnouncement.title || '',
                            content: dashboardAnnouncement.content || '',
                            author: user?.name || 'Admin'
                          });
                          setShowAnnouncementForm(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                    {!dashboardAnnouncement && (
                      <button
                        onClick={() => setShowAnnouncementForm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <MdAdd className="w-4 h-4" />
                        Add Announcement
                      </button>
                    )}
                    {dashboardAnnouncement && (
                      <button
                        onClick={deleteDashboardAnnouncement}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              {dashboardAnnouncement ? (
                <div>
                  {dashboardAnnouncement.title && (
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {dashboardAnnouncement.title}
                    </h3>
                  )}
                  <div 
                    className="prose max-w-none tinymce-content text-gray-700"
                    dangerouslySetInnerHTML={{ __html: dashboardAnnouncement.content }}
                  />
                  <div className="mt-4 text-xs text-gray-500">
                    By {dashboardAnnouncement.author} • {new Date(dashboardAnnouncement.updatedAt || dashboardAnnouncement.date).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBullhorn className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No dashboard announcement available.</p>
                  {isAdmin && (
                    <p className="text-sm mt-1">Click "Add Announcement" to create one.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Video Section */}
        <DashboardVideoSection isAdmin={isAdmin} />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              {isAdmin ? (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Manage Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Live Lectures
                  </a>
                  <button 
                    onClick={() => setVideoManagementOpen(true)}
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base"
                  >
                    Manage Videos
                  </button>
                </>
              ) : (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Browse Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    My Classes
                  </a>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
            <div className="text-sm text-gray-600">
              <p>No recent activity to display.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notifications</h3>
            <div className="text-sm text-gray-600">
              <p>No new notifications.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Announcement Form Modal */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaBullhorn className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {dashboardAnnouncement ? 'Edit Dashboard Announcement' : 'Add Dashboard Announcement'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAnnouncementForm(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit(saveDashboardAnnouncement)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter announcement title..."
                />
              </div>
              
              <div>
                <RTE
                  name="content"
                  control={control}
                  label="Content *"
                  defaultValue=""
                  rules={{ required: 'Content is required' }}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-red-500">Content is required</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : (dashboardAnnouncement ? 'Update Announcement' : 'Save Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Video Management Modal */}
      {isAdmin && (
        <VideoManagementForm 
          isOpen={videoManagementOpen} 
          onClose={() => setVideoManagementOpen(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;