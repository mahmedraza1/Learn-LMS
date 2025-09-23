import React from 'react';

const Courses = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Courses</h1>
            <p className="text-lg text-gray-600">
              Course management section. Here you'll be able to create, edit, and manage 
              all your courses, curriculum, assignments, and student progress.
            </p>
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Coming Soon</h3>
                <p className="text-blue-600">
                  Full course management features including course creation, 
                  content upload, student enrollment, and progress tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;