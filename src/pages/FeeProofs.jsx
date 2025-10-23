import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAdmin } from '../store/slices/authSlice';
import { MdReceipt, MdCheckCircle, MdPending, MdCancel, MdImage, MdCalendarToday } from 'react-icons/md';
import { FaDownload, FaEye } from 'react-icons/fa';

const FeeProofs = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get fee proof images from user data
  const feeProofImages = user?.fee_proof_images || [];
  const feeStatus = user?.fee_status || 'Unknown';
  const admissionStatus = user?.admission_status || 'Unknown';

  // Function to open image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  // Function to download image
  const downloadImage = (imageUrl, index) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `fee-proof-${index + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get fee status color and icon
  const getFeeStatusDisplay = () => {
    switch (feeStatus) {
      case 'Paid':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <MdCheckCircle className="w-6 h-6" />
        };
      case 'Pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <MdPending className="w-6 h-6" />
        };
      case 'Unpaid':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <MdCancel className="w-6 h-6" />
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <MdReceipt className="w-6 h-6" />
        };
    }
  };

  const statusDisplay = getFeeStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MdReceipt className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                Fee Submission Proofs
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                View and manage your fee payment proofs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Fee Status Card */}
        <div className={`mb-6 rounded-lg border-2 ${statusDisplay.borderColor} ${statusDisplay.bgColor} p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`${statusDisplay.color} flex-shrink-0`}>
                {statusDisplay.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
                <p className={`text-2xl font-bold ${statusDisplay.color} mt-1`}>
                  {feeStatus}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MdCheckCircle className="w-4 h-4" />
                <span>Admission Status: <strong>{admissionStatus}</strong></span>
              </div>
              {user?.batch && user.batch !== 'Unassigned' && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MdCalendarToday className="w-4 h-4" />
                  <span>Batch: <strong>{user.batch}</strong></span>
                </div>
              )}
              {user?.upcoming_batch && user.upcoming_batch !== 'Unassigned' && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MdCalendarToday className="w-4 h-4" />
                  <span>Upcoming Batch: <strong>
                    {user.upcoming_batch?.includes("A") ? "Batch A" : user.upcoming_batch?.includes("B") ? "Batch B" : user.upcoming_batch}
                  </strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fee Proof Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MdImage className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              Submitted Fee Proofs ({feeProofImages.length})
            </h2>
          </div>

          {feeProofImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {feeProofImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {/* Image Preview */}
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Fee Proof ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openImageModal(imageUrl)}
                          className="bg-white text-gray-900 p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          title="View Full Size"
                        >
                          <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => downloadImage(imageUrl, index)}
                          className="bg-white text-gray-900 p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          title="Download"
                        >
                          <FaDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3 sm:p-4">
                    <p className="text-sm font-medium text-gray-900">
                      Fee Proof #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Click to view or download
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MdImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No fee proofs submitted yet</p>
              <p className="text-gray-400 text-sm">
                Your fee payment proofs will appear here once submitted
              </p>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>All fee proofs are securely stored and reviewed by our team.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Please allow up to 24 hours for fee verification after submission.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>If you have any questions, contact us at <strong>contact@learn.pk</strong></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-gray-900 p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg z-10"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Fee Proof Full Size"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeProofs;
