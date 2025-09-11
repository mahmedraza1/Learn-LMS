import React from "react";

const StudentPendingView = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Account Verification Pending</h1>
        </div>
        
        <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
          <p className="mb-3">
            Your account is pending verification.
          </p>
          <p className="mb-3">
            If you have paid your fee, please wait for approval.
          </p>
          <p>
            If not, please pay your fee or contact us at:
          </p>
          <div className="mt-3">
            <p>
              📧 <a href="mailto:contact@learn.pk" className="font-medium text-yellow-800 underline hover:text-yellow-900">contact@learn.pk</a>
            </p>
            <p>
              📱 WhatsApp: <a href="https://wa.me/923177569038" target="_blank" rel="noopener noreferrer" className="font-medium text-yellow-800 underline hover:text-yellow-900">+923177569038</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPendingView;
