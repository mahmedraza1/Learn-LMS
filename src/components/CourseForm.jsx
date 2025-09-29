import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

const CourseForm = ({ isOpen, onClose, onSubmit, course = null }) => {
  const isEditMode = !!course;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: course?.name || "",
      thumbnail: course?.thumbnail || "",
      description: course?.description || "",
      enrolledStudents: course?.enrolledStudents || 0,
      duration: course?.duration || "",
      level: course?.level || "None",
      instructor: course?.instructor || "",
      rating: course?.rating || 0,
      totalRatings: course?.totalRatings || 0,
      tags: course?.tags?.join(", ") || ""
    }
  });

  // Update form values when course prop changes
  useEffect(() => {
    if (course) {
      Object.keys(course).forEach(key => {
        if (key === 'tags') {
          setValue(key, course[key]?.join(", ") || "");
        } else {
          setValue(key, course[key] || "");
        }
      });
    }
  }, [course, setValue]);

  const submitHandler = async (data) => {
    console.log('Submitting course data:', data);
    
    // Process tags from comma-separated string to array
    const processedData = {
      ...data,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      enrolledStudents: parseInt(data.enrolledStudents) || 0,
      rating: parseFloat(data.rating) || 0,
      totalRatings: parseInt(data.totalRatings) || 0
    };
    
    await onSubmit(processedData);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Edit Course" : "Add New Course"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              {...register("name", { required: "Course name is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter course name..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Course Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL *
            </label>
            <input
              type="url"
              {...register("thumbnail", { required: "Thumbnail URL is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.thumbnail && (
              <p className="mt-1 text-xs text-red-500">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register("description", { required: "Description is required" })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter course description..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Row 1: Enrolled Students & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrolled Students
              </label>
              <input
                type="number"
                {...register("enrolledStudents")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                {...register("duration", { required: "Duration is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g., 8 weeks"
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Level & Instructor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level *
              </label>
              <select
                {...register("level", { required: "Level is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="None">None</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Beginner to Advanced">Beginner to Advanced</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-xs text-red-500">{errors.level.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor *
              </label>
              <input
                type="text"
                {...register("instructor", { required: "Instructor name is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter instructor name..."
              />
              {errors.instructor && (
                <p className="mt-1 text-xs text-red-500">{errors.instructor.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register("rating")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="4.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Ratings
              </label>
              <input
                type="number"
                min="0"
                {...register("totalRatings")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="156"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              {...register("tags")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., Web Development, JavaScript, React"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas (e.g., Web Development, JavaScript, React)
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update Course" : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;