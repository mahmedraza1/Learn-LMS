import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaBullhorn } from "react-icons/fa";
import { MdClose, MdAdd } from "react-icons/md";
import parse from "html-react-parser";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { selectUser, selectIsAdmin } from "../store/slices/authSlice";
import { clearLiveClassAnnouncement, setLiveClassAnnouncement, fetchLiveClassAnnouncement } from "../store/slices/liveClassAnnouncementSlice";
import toast from "react-hot-toast";
import RTE from "./RTE";

const LiveClassAnnouncement = ({ isAdmin }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { announcement, loading } = useAppSelector(state => state.liveClassAnnouncement);
  
  // State for admin form
  const [showAddForm, setShowAddForm] = useState(false);
  
  // React Hook Form setup
  const { control, handleSubmit, reset, register, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      author: 'Learn pk'
    }
  });

  useEffect(() => {
    dispatch(fetchLiveClassAnnouncement());
  }, [dispatch]);
  
  // Safely parse the HTML content with a fallback
  const renderContent = () => {
    try {
      // Make sure content is a string before parsing
      const contentStr = typeof announcement.content === 'string' 
        ? announcement.content 
        : String(announcement.content || '');
      
      // Parse options to preserve styling with orange theme classes for live announcements
      const options = {
        replace: (domNode) => {
          if (domNode.type === 'tag') {
            // Ensure all DOM nodes have the proper className
            if (!domNode.attribs) domNode.attribs = {};
            
            // Add specific classes for different elements with orange theme
            if (domNode.name === 'h1') {
              domNode.attribs.className = 'live-announcement-h1';
            }
            if (domNode.name === 'h2') {
              domNode.attribs.className = 'live-announcement-h2';
            }
            if (domNode.name === 'h3') {
              domNode.attribs.className = 'live-announcement-h3';
            }
            if (domNode.name === 'ul') {
              domNode.attribs.className = 'live-announcement-ul';
            }
            if (domNode.name === 'ol') {
              domNode.attribs.className = 'live-announcement-ol';
            }
            if (domNode.name === 'li') {
              domNode.attribs.className = 'live-announcement-li';
            }
            if (domNode.name === 'blockquote') {
              domNode.attribs.className = 'live-announcement-blockquote';
            }
          }
          return undefined;
        }
      };
        
      // Parse HTML content with options
      return parse(contentStr, options);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return <p>Error displaying announcement content</p>;
    }
  };

  // Handle clearing the live class announcement (admin only)
  const handleClearAnnouncement = async () => {
    if (!isAdmin) return;
    
    try {
      await dispatch(clearLiveClassAnnouncement()).unwrap();
      toast.success("Live class announcement cleared successfully");
    } catch (error) {
      toast.error(`Failed to clear announcement: ${error}`);
    }
  };

  // Handle form submission for new live class announcement
  const submitHandler = async (data) => {
    if (!isAdmin) return;

    if (!data.content?.trim()) {
      toast.error("Please enter announcement content");
      return;
    }

    try {
      await dispatch(setLiveClassAnnouncement({
        title: data.title,
        content: data.content,
        author: 'Learn pk'
      })).unwrap();
      
      toast.success("Live class announcement added successfully");
      setShowAddForm(false);
      reset();
    } catch (error) {
      toast.error(`Failed to add announcement: ${error}`);
    }
  };

  // Handle canceling the form
  const handleCancel = () => {
    setShowAddForm(false);
    reset();
  };

  // If no announcement and not showing add form, show add button for admin
  if (!announcement && !showAddForm) {
    return isAdmin ? (
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-3 text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <MdAdd className="h-5 w-5" />
          Add Live Class Announcement
        </button>
      </div>
    ) : null;
  }

  // Show add form for admin
  if (showAddForm && isAdmin) {
    return (
      <div className="mb-4 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FaBullhorn className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Live Class Announcement</h3>
        </div>
        
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (Optional)
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Enter announcement title..."
            />
          </div>
          
          <div>
            <RTE
              name="content"
              control={control}
              label="Content *"
              defaultValue=""
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">Content is required</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Announcement"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Show existing announcement
  if (announcement) {
    return (
      <div className="mb-4 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm relative">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FaBullhorn className="h-5 w-5 text-orange-600" />
          </div>
          
          <div className="min-w-0 flex-1">
            {/* Live class announcement badge */}
            <div className="mb-2 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              🔴 Live Class Announcement
            </div>
            
            {/* Title */}
            {announcement.title && announcement.title.trim() && (
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {announcement.title}
              </h3>
            )}
            
            {/* Content */}
            <div className="live-announcement-content prose prose-sm max-w-none text-gray-700">
              {renderContent()}
            </div>
            
            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-orange-200 pt-3 text-xs text-gray-600">
              <span>
                By: <span className="font-medium">Learn pk</span>
              </span>
              <span>
                {new Date(announcement.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Close button for admin */}
          {isAdmin && (
            <button
              onClick={handleClearAnnouncement}
              className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors p-1 hover:bg-orange-100 rounded"
              title="Clear Live Class Announcement"
            >
              <MdClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LiveClassAnnouncement;