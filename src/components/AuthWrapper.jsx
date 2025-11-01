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
  // Check for students specifically and ensure they have:
  // - Granted status, OR
  // - Trial status, OR
  // - BOTH Fee Pending admission status AND Pending Renewal fee status
  if (isStudent) {
    const hasValidAdmission = 
      user?.admission_status === 'Granted' || 
      user?.admission_status === 'Trial' ||
      (user?.admission_status === 'Fee Pending' && user?.fee_status === 'Pending Renewal');
    
    
    if (!hasValidAdmission) {
      return <StudentPendingView />;
    }
  }

  // Additional safety check removed - redundant with above check

  // For authenticated users with proper access, render children (which will include the Layout)
  return children;
};

export default AuthWrapper;