import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserData, selectUser, selectIsAdmin, selectIsStudent, selectIsGuest, selectAuthLoading, selectHasGrantedAdmission } from '../store/slices/authSlice';
import { initializeBatchData, selectSelectedBatch } from '../store/slices/batchSlice';
import { fetchLecturesForBatch, fetchAnnouncementsForBatch } from '../store/slices/lectureSlice';
import { fetchGlobalAnnouncements } from '../store/slices/announcementSlice';
import GuestView from '../pages/GuestView';
import StudentPendingView from '../pages/StudentPendingView';

const AuthWrapper = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStudent = useAppSelector(selectIsStudent);
  const isGuest = useAppSelector(selectIsGuest);
  const hasGrantedAdmission = useAppSelector(selectHasGrantedAdmission);
  const loading = useAppSelector(selectAuthLoading);
  const selectedBatch = useAppSelector(selectSelectedBatch);

  // Debug logging
  console.log('AuthWrapper Debug:', {
    user,
    isAdmin,
    isStudent,
    isGuest,
    hasGrantedAdmission,
    loading,
    admission_status: user?.admission_status
  });

  useEffect(() => {
    // Fetch user data on app initialization
    dispatch(fetchUserData());
    // Fetch global announcements
    dispatch(fetchGlobalAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    // Initialize batch data when user is loaded
    if (user) {
      dispatch(initializeBatchData({ user, isAdmin }));
    }
  }, [user, isAdmin, dispatch]);

  useEffect(() => {
    // Fetch lectures and announcements when batch is selected
    if (selectedBatch) {
      dispatch(fetchLecturesForBatch(selectedBatch));
      dispatch(fetchAnnouncementsForBatch(selectedBatch));
    }
  }, [selectedBatch, dispatch]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-3 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If user data hasn't been loaded yet, show loading
  if (user === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-3 text-lg font-medium text-gray-700">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Guest view - render without layout
  if (isGuest) {
    return <GuestView />;
  }

  // MAIN AUTH PROTECTION: Student with no granted admission - cannot access site
  // Check for students specifically and ensure they have granted admission
  if (isStudent) {
    if (!hasGrantedAdmission || user?.admission_status !== 'Granted') {
      return <StudentPendingView />;
    }
  }

  // Additional safety check: if user has student role but no granted admission
  if (user?.roles?.includes('student') && user?.admission_status !== 'Granted') {
    return <StudentPendingView />;
  }

  // For authenticated users with proper access, render children (which will include the Layout)
  return children;
};

export default AuthWrapper;