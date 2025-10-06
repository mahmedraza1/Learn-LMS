import React, { useState, useEffect } from "react";

const StudentPendingView = () => {
  const [countdown, setCountdown] = useState(15);

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
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-lg mx-4 rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Pending</h1>
          <p className="text-gray-600">Your account verification is in progress</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border border-yellow-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⏳ Verification Process</h2>
            <p className="text-yellow-700 mb-3">
              Your admission is currently under review. Please allow up to <strong>24 hours</strong> for approval after payment confirmation.
            </p>
          </div>
          
          <div className="border-t border-yellow-200 pt-4">
            <h3 className="text-md font-semibold text-yellow-800 mb-3">Need Help?</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <a href="mailto:contact@learn.pk" className="font-medium text-yellow-800 underline hover:text-yellow-900 transition-colors">
                  contact@learn.pk
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📱</span>
                <a 
                  href="https://wa.me/923177569038" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-yellow-800 underline hover:text-yellow-900 transition-colors"
                >
                  WhatsApp: +923177569038
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="mb-3 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            Redirecting to Learn.pk in <span className="font-bold text-yellow-800">{countdown}</span> seconds...
          </div>
          <p className="text-sm text-gray-500">
            Thank you for your patience. You'll receive access once your admission is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPendingView;
