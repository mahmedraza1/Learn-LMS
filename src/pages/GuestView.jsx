import React from "react";

const GuestView = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Learn.pk</h1>
          <p className="mt-2 text-gray-600">Please log in to continue.</p>
        </div>
        
        <div className="rounded-md bg-blue-50 p-4 text-blue-800">
          <p className="text-center">
            Please log in at <a href="https://learn.pk" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline hover:text-blue-800">Learn.pk</a> to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestView;
