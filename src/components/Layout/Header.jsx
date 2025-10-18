/*
 * Learn LMS - Header Component
 * Developed by Mark for Learn.pk
 * Copyright (c) 2025 Mark. All rights reserved.
 * Proprietary software - Unauthorized use prohibited
 */

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
const getDisplayRole = (roles, admissionStatus) => {
  if (!roles || !Array.isArray(roles)) return 'Student';
  
  if (roles.includes('administrator')) return 'Administrator';
  if (roles.includes('instructor')) return 'Instructor';
  if (roles.includes('student')) {
    // Show Trial status for trial students
    if (admissionStatus === 'Trial') {
      return 'Student (Trial)';
    }
    return 'Student';
  }
  
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
            author: 'Learn.pk',
            updated_at: new Date().toISOString()
          }
        })).unwrap();
        toast.success('Announcement updated successfully');
      } else {
        // Add new announcement
        await dispatch(addGlobalAnnouncement({
          ...data,
          author: 'Learn.pk'
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
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Left side - Page info */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{getPageTitle()}</h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{getPagePath()}</p>
          </div>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button 
              ref={notificationButtonRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-500 hover:text-gray-700 transition-colors relative p-2 rounded-lg hover:bg-gray-100"
            >
              <MdNotifications className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
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

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className={`text-xs ${user?.admission_status === 'Trial' ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                {getDisplayRole(user?.roles, user?.admission_status)}
              </p>
            </div>
            <div className={`w-8 h-8 ${user?.admission_status === 'Trial' ? 'bg-amber-500' : 'bg-[#0D7C66]'} rounded-full flex items-center justify-center`}>
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