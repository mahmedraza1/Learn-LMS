import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

const AnnouncementForm = ({ isOpen, onClose, onSubmit, announcement = null }) => {
  const isEditMode = !!announcement;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || ""
    }
  });

  // Handle form submission
  const submitHandler = async (data) => {
    await onSubmit({
      ...data,
      id: announcement?.id
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
            {isEditMode ? "Edit Announcement" : "Add Announcement"}
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
          {/* Announcement title field */}
          <div className="mb-4">
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Announcement Title
            </label>
            <input
              id="title"
              type="text"
              className={`w-full rounded-md border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              placeholder="Enter announcement title"
              {...register("title", { 
                required: "Title is required" 
              })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Announcement content field */}
          <div className="mb-4">
            <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
              Announcement Content
            </label>
            <textarea
              id="content"
              rows={5}
              className={`w-full rounded-md border ${
                errors.content ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              placeholder="Enter announcement content..."
              {...register("content", { 
                required: "Content is required" 
              })}
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
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

export default AnnouncementForm;
