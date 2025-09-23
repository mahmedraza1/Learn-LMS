import React from 'react';

const Groups = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Groups</h1>
            <p className="text-lg text-gray-600">
              Group management for organizing students into batches, study groups, 
              and collaborative learning environments.
            </p>
            <div className="mt-8">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">Group Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="text-left">
                    <h4 className="font-medium text-purple-700">Student Batches</h4>
                    <p className="text-sm text-purple-600">Organize students by enrollment period</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-purple-700">Study Groups</h4>
                    <p className="text-sm text-purple-600">Small collaborative learning groups</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-purple-700">Group Discussions</h4>
                    <p className="text-sm text-purple-600">Forum-style communication</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-purple-700">Group Assignments</h4>
                    <p className="text-sm text-purple-600">Collaborative project management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;