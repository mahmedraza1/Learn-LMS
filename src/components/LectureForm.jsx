import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

const LectureForm = ({ isOpen, onClose, onSubmit, lecture = null }) => {
  // If lecture exists and has a YouTube URL, it's edit mode, otherwise it's add mode
  const isEditMode = !!(lecture && lecture.youtube_url);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      youtubeUrl: lecture?.youtube_url || ""
    }
  });

  // Handle form submission
  const submitHandler = async (data) => {
    await onSubmit({
      ...data,
      id: lecture?.id
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Edit Lecture" : "Add New Lecture"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)}>
          {/* Lecture title info */}
          <div className="mb-4 rounded-md bg-gray-50 p-3">
            <label className="block text-sm font-medium text-gray-700">
              Lecture Title
            </label>
            <p className="mt-1 text-sm text-gray-600">
              {isEditMode ? 
                lecture?.title || "Lecture" : 
                "Lecture titles are automatically numbered (Lecture 1, Lecture 2, etc.)"}
            </p>
          </div>

          {/* YouTube URL field */}
          <div className="mb-4">
            <label htmlFor="youtubeUrl" className="mb-1 block text-sm font-medium text-gray-700">
              YouTube URL
            </label>
            <input
              id="youtubeUrl"
              type="text"
              className={`w-full rounded-md border ${
                errors.youtubeUrl ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              placeholder="https://www.youtube.com/watch?v=..."
              {...register("youtubeUrl", { 
                required: "YouTube URL is required",
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/,
                  message: "Invalid YouTube URL format"
                }
              })}
            />
            {errors.youtubeUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.youtubeUrl.message}</p>
            )}
          </div>

          {/* Note about automatic date scheduling */}
          <div className="mb-6 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            <p>
              <strong>Note:</strong> Lecture dates are automatically scheduled based on the batch. 
              Batch A lectures are held on odd dates, while Batch B lectures are held on even dates.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#0d7c66] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a6a58] disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureForm;
