import React, { useState } from 'react';
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin } from "../store/slices/authSlice";
import DashboardStats from '../components/DashboardStats';
import DashboardVideoSection from '../components/DashboardVideoSection';
import VideoManagementForm from '../components/VideoManagementForm';

const Dashboard = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [videoManagementOpen, setVideoManagementOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
              </h1>
              <p className="mt-1 text-lg text-gray-600">
                Welcome back, {user?.name || 'User'}
              </p>
            </div>
            {!isAdmin && user?.batch && (
              <div className="mt-3 sm:mt-0">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                  {user.batch}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Statistics */}
        <DashboardStats user={user} isAdmin={isAdmin} />
        
        {/* Video Section */}
        <DashboardVideoSection isAdmin={isAdmin} />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {isAdmin ? (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
                    Manage Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
                    Live Lectures
                  </a>
                  <button 
                    onClick={() => setVideoManagementOpen(true)}
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                  >
                    Manage Videos
                  </button>
                </>
              ) : (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
                    Browse Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors">
                    My Classes
                  </a>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-sm text-gray-600">
              <p>No recent activity to display.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="text-sm text-gray-600">
              <p>No new notifications.</p>
            </div>
          </div>
        </div>
      </div>
      
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