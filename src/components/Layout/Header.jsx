import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdSearch, 
  MdNotifications, 
  MdSettings 
} from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { selectGlobalAnnouncements, addGlobalAnnouncement, updateGlobalAnnouncement } from '../../store/slices/announcementSlice';
import toast from 'react-hot-toast';
import NotificationPopup from '../NotificationPopup';
import FastAnnouncementModal from '../FastAnnouncementModal';
import AnnouncementForm from '../AnnouncementForm';

// Helper function to get display role from roles array
const getDisplayRole = (roles) => {
  if (!roles || !Array.isArray(roles)) return 'Student';
  
  if (roles.includes('administrator')) return 'Administrator';
  if (roles.includes('instructor')) return 'Instructor';
  if (roles.includes('student')) return 'Student';
  
  return 'Student'; // Default fallback
};

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const globalAnnouncements = useAppSelector(selectGlobalAnnouncements);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const notificationButtonRef = useRef(null);

  // Count unread notifications (for demo, we'll consider all as unread)
  const unreadCount = globalAnnouncements ? globalAnnouncements.length : 0;

  // Handle announcement click from notification popup
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);
    setShowNotifications(false); // Close notifications popup
  };

  // Close announcement modal
  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setSelectedAnnouncement(null);
  };

  // Handle add announcement from notification popup
  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setShowAnnouncementForm(true);
  };

  // Handle edit announcement from notification popup
  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  // Close announcement form
  const closeAnnouncementForm = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
  };

  // Handle announcement form submission
  const handleAnnouncementSubmit = async (data) => {
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        await dispatch(updateGlobalAnnouncement({
          id: editingAnnouncement.id,
          updatedData: {
            ...data,
            author: user?.name || 'Admin',
            updated_at: new Date().toISOString()
          }
        })).unwrap();
        toast.success('Announcement updated successfully');
      } else {
        // Add new announcement
        await dispatch(addGlobalAnnouncement({
          ...data,
          author: user?.name || 'Admin'
        })).unwrap();
        toast.success('Announcement added successfully');
      }
      closeAnnouncementForm();
    } catch (error) {
      toast.error(`Failed to ${editingAnnouncement ? 'update' : 'add'} announcement: ${error}`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/courses':
        return 'Courses';
      case '/live-lecture':
        return 'Live Lecture';
      case '/groups':
        return 'Groups';
      default:
        return 'Dashboard';
    }
  };

  const getPagePath = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Home / Dashboard';
      case '/courses':
        return 'Home / Courses';
      case '/live-lecture':
        return 'Home / Live Lecture';
      case '/groups':
        return 'Home / Groups';
      default:
        return 'Home / Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Page info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">{getPagePath()}</p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search lectures, courses..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              ref={notificationButtonRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-500 hover:text-gray-700 transition-colors relative p-2 rounded-lg hover:bg-gray-100"
            >
              <MdNotifications className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <NotificationPopup 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onAnnouncementClick={handleAnnouncementClick}
              onAddAnnouncement={handleAddAnnouncement}
              onEditAnnouncement={handleEditAnnouncement}
              triggerRef={notificationButtonRef}
            />
          </div>

          {/* Settings */}
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <MdSettings className="w-6 h-6" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{getDisplayRole(user?.roles)}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal - Rendered at Header level */}
      <FastAnnouncementModal 
        isOpen={showAnnouncementModal}
        onClose={closeAnnouncementModal}
        announcement={selectedAnnouncement}
      />

      {/* Announcement Form Modal for Add/Edit */}
      <AnnouncementForm
        isOpen={showAnnouncementForm}
        onClose={closeAnnouncementForm}
        onSubmit={handleAnnouncementSubmit}
        announcement={editingAnnouncement}
      />
    </header>
  );
};

export default Header;