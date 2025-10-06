import React, { useState, useEffect } from "react";

const GuestView = () => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = 'https://learn.pk/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-100">
      <div className="max-w-lg mx-4 rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Learn.pk LMS</h1>
          <p className="text-gray-600">Your gateway to quality education</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 p-6 border border-emerald-200">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-emerald-800 mb-3">🔐 Login Required</h2>
            <p className="text-emerald-700 mb-4">
              Please log in to access your courses, lectures, and learning materials.
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-emerald-700 mb-3">Visit our main website to log in:</p>
              <div className="mb-3 text-sm text-emerald-600">
                Redirecting to Learn.pk in <span className="font-bold text-emerald-800">{countdown}</span> seconds...
              </div>
              <a 
                href="https://learn.pk/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to Learn.pk
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            New to Learn.pk? Contact us for enrollment information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestView;
