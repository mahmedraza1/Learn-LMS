import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { validateDateForCourse } from "../utils/courseScheduleRules";

const LectureForm = ({ isOpen, onClose, onSubmit, lecture = null, batch = null }) => {
  // If lecture exists and has a YouTube URL, it's edit mode, otherwise it's add mode
  const isEditMode = !!(lecture && lecture.youtube_url);
  
  // State to store the selected date's day for validation
  const [selectedDay, setSelectedDay] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setError,
    clearErrors,
    setValue
  } = useForm({
    defaultValues: {
      lectureName: lecture?.title || "",
      lectureDate: lecture?.date ? new Date(lecture.date).toISOString().split('T')[0] : "",
      lectureTime: lecture?.time || "",
      youtubeUrl: lecture?.youtube_url || ""
    }
  });
  
  // When lecture prop changes, reset form with new values
  React.useEffect(() => {
    if (lecture) {
      // Reset the form with new values when lecture changes
      reset({
        lectureName: lecture.title || "",
        lectureDate: lecture.date ? new Date(lecture.date).toISOString().split('T')[0] : "",
        lectureTime: lecture.time || "",
        youtubeUrl: lecture.youtube_url || ""
      });
      
      // Also set values individually to ensure the form updates
      setValue("lectureName", lecture.title || "");
      if (lecture.date) {
        setValue("lectureDate", new Date(lecture.date).toISOString().split('T')[0]);
      }
      setValue("lectureTime", lecture.time || "");
      setValue("youtubeUrl", lecture.youtube_url || "");
      
      // If we have a date, update the selectedDay
      if (lecture.date) {
        const date = new Date(lecture.date);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        setSelectedDay(days[date.getDay()]);
      }
    }
  }, [lecture, setValue, reset]);

  // Watch the date field to update selectedDay
  const watchDate = watch("lectureDate");
  
  // Update the day of week when date changes and validate date
  React.useEffect(() => {
    if (watchDate) {
      const date = new Date(watchDate);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = days[date.getDay()];
      setSelectedDay(day);
      
      // Get the necessary info for validation
      const activeBatch = batch || lecture?.course?.batch || lecture?.batch;
      const courseTitle = lecture?.course?.title || lecture?.title;
      
      // Check if the date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
      
      if (date < today) {
        setError("lectureDate", {
          type: "manual",
          message: "Cannot schedule lectures for past dates"
        });
        return;
      }
      
      // If we have all the info needed for full validation, use the helper function
      if (courseTitle && activeBatch) {
        const validation = validateDateForCourse(date, courseTitle, activeBatch);
        
        if (!validation.isValid) {
          setError("lectureDate", {
            type: "manual",
            message: validation.message
          });
          return;
        }
      } else {
        // Basic validation if course title or batch is missing
        // Check batch-specific rules
        const dayOfMonth = date.getDate();
        
        if (activeBatch === "Batch A" && (dayOfMonth > 27)) {
          setError("lectureDate", {
            type: "manual",
            message: "Batch A lectures only run from 1st to 27th of each month"
          });
          return;
        }
        
        if (activeBatch === "Batch B") {
          const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          
          // If it's the last day of a month with 31 days, it's a leave day for Batch B
          if (lastDayOfMonth === 31 && dayOfMonth === 31) {
            setError("lectureDate", {
              type: "manual",
              message: "The 31st is a leave day for Batch B"
            });
            return;
          }
          
          // Check if the date is within the Batch B schedule (16th to end of month, or 1st to 12th of next month)
          const isSecondHalfOfMonth = dayOfMonth >= 16;
          const isFirstHalfOfNextMonth = dayOfMonth <= 12;
          
          if (!isSecondHalfOfMonth && !isFirstHalfOfNextMonth) {
            setError("lectureDate", {
              type: "manual",
              message: "Batch B lectures run from 16th to end of month, and 1st to 12th of next month"
            });
            return;
          }
        }
      }
      
      clearErrors("lectureDate");
    }
  }, [watchDate, setError, clearErrors, lecture, batch]);

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);
  
  // Handle form submission
  const submitHandler = async (data) => {
    const lectureDate = new Date(data.lectureDate);
    
    // Don't submit if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
    if (lectureDate < today) {
      setError("lectureDate", {
        type: "manual", 
        message: "Cannot schedule lectures for past dates"
      });
      return;
    }
    
    // Prepare the data for submission with the correct structure
    const formattedData = {
      lectureName: data.lectureName,
      lectureDate: data.lectureDate,
      lectureTime: data.lectureTime,
      youtubeUrl: data.youtubeUrl,
      // These fields might be used by the update function
      id: lecture?.id,
      delivered: lecture?.delivered
    };
    
    await onSubmit(formattedData);
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
          {/* Lecture name field */}
          <div className="mb-4">
            <label htmlFor="lectureName" className="mb-1 block text-sm font-medium text-gray-700">
              Lecture Name
            </label>
            <input
              id="lectureName"
              type="text"
              className={`w-full rounded-md border ${
                errors.lectureName ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              placeholder="Enter lecture name"
              {...register("lectureName", { 
                required: "Lecture name is required"
              })}
            />
            {errors.lectureName && (
              <p className="mt-1 text-xs text-red-500">{errors.lectureName.message}</p>
            )}
          </div>

          {/* Lecture date field */}
          <div className="mb-4">
            <label htmlFor="lectureDate" className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="lectureDate"
              type="date"
              className={`w-full rounded-md border ${
                errors.lectureDate ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              {...register("lectureDate", { 
                required: "Lecture date is required"
              })}
            />
            {selectedDay && (
              <p className="mt-1 text-xs text-blue-600">
                Day: {selectedDay}
              </p>
            )}
            {errors.lectureDate && (
              <p className="mt-1 text-xs text-red-500">{errors.lectureDate.message}</p>
            )}
          </div>

          {/* Lecture time field */}
          <div className="mb-4">
            <label htmlFor="lectureTime" className="mb-1 block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              id="lectureTime"
              type="time"
              className={`w-full rounded-md border ${
                errors.lectureTime ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-[#0d7c66] focus:outline-none focus:ring-1 focus:ring-[#0d7c66]`}
              {...register("lectureTime", { 
                required: "Lecture time is required"
              })}
            />
            {errors.lectureTime && (
              <p className="mt-1 text-xs text-red-500">{errors.lectureTime.message}</p>
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

          {/* Note about scheduling rules */}
          <div className="mb-6 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            <p>
              <strong>Note:</strong> Batch A lectures run from 1st to 27th of each month. 
              Batch B lectures run from 16th of current month to 12th of next month.
              Lectures cannot be scheduled for past dates.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
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
