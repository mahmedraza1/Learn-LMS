import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import RTE from "./RTE";

const AnnouncementForm = ({ isOpen, onClose, onSubmit, announcement = null }) => {
  const isEditMode = !!announcement;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue
  } = useForm({
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || ""
    },
    // Add validation rule for content
    rules: {
      content: {
        required: "Content is required"
      }
    }
  });
  
  // When in edit mode, ensure form is properly initialized with existing content
  React.useEffect(() => {
    if (isEditMode && announcement) {
      setValue("title", announcement.title || "");
      setValue("content", announcement.content || "");
    }
  }, [isEditMode, announcement, setValue]);

  // Handle form submission
  const submitHandler = async (data) => {
    // Log the data being submitted
    
    // Make sure content is a string
    const formattedData = {
      ...data,
      id: announcement?.id,
      content: data.content || ''
    };
    
    // Data already includes content from the Controller
    await onSubmit(formattedData);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
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
          {/* Hidden title field - we will use a default placeholder title */}
          <input
            type="hidden"
            {...register("title", { 
              value: "Announcement" // Default placeholder title 
            })}
          />

          {/* Announcement content field with React Hook Form Controller */}
          <div className="mb-4">
            <RTE 
              name="content"
              control={control}
              label="Announcement Content (Use headings for titles)"
              defaultValue={announcement?.content || ""}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">Content is required</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use heading formats (H1, H2, etc.) in the editor for titles, and regular text for content.
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

export default AnnouncementForm;
