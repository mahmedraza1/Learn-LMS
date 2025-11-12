import React from 'react';

const FeePendingRestriction = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg bg-red-50 border-2 border-red-200 p-6 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-red-900 text-center">Fee Pending!</h2>
          
          <p className="text-center text-red-800 mb-6">
            If the fee is <strong>not</strong> paid, Your seat meay be alloted to another student.
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">📹 Watch recorded and live lectures</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">👥 Join Your Community Groups</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">📚 Access course notes and study materials</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">❓ Review FAQs for each course</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">📖 Read course overviews and announcements</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <a
              href="https://learn.pk/dashboard"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Pay Fee Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePendingRestriction;
