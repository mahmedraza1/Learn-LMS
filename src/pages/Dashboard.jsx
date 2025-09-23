import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <p className="text-lg text-gray-600">
              Welcome to the Learn LMS Dashboard. This page will contain analytics, 
              recent activities, and quick access to your courses and lectures.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-800">Total Courses</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-2">12</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800">Active Lectures</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800">Students</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">156</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;