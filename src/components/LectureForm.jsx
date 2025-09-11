import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

const LectureForm = ({ isOpen, onClose, onSubmit, lecture = null }) => {
  const isEditMode = !!lecture;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      title: lecture?.title || "",
      youtubeUrl: lecture?.youtube_url || "",
      date: lecture?.date 
        ? new Date(lecture.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
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
          {/* Title field */}
          <div className="mb-4">
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Lecture Title
            </label>
            <input
              id="title"
              type="text"
              className={`w-full rounded-md border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              placeholder="Enter lecture title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
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

          {/* Date field */}
          <div className="mb-6">
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
              Lecture Date
            </label>
            <input
              id="date"
              type="date"
              className={`w-full rounded-md border ${
                errors.date ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
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
