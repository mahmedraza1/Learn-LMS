import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectIsAdmin } from '../../store/slices/authSlice';
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel, MdAnnouncement } from 'react-icons/md';
import Editor from '../Editor';
import toast from 'react-hot-toast';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const AnnouncementsNews = ({ course }) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const [announcements, setAnnouncements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch course announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}/announcements`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
      setAnnouncements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      fetchAnnouncements();
    }
  }, [course?.id]);

  // Handle add new announcement
  const handleAddNew = () => {
    setEditingId(null);
    setAnnouncementTitle('');
    setEditorContent('');
    setIsEditing(true);
  };

  // Handle edit announcement
  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setAnnouncementTitle(announcement.title);
    setEditorContent(announcement.content);
    setIsEditing(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!announcementTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      const url = editingId 
        ? `${API_BASE_URL}/courses/${course.id}/announcements/${editingId}`
        : `${API_BASE_URL}/courses/${course.id}/announcements`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementTitle,
          content: editorContent,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const savedAnnouncement = responseData.announcement || responseData;
        
        // Update the local state instead of fetching all announcements
        if (editingId) {
          // Update existing announcement
          setAnnouncements(prev => 
            prev.map(ann => ann.id === editingId ? savedAnnouncement : ann)
          );
        } else {
          // Add new announcement
          setAnnouncements(prev => [savedAnnouncement, ...prev]);
        }
        
        setIsEditing(false);
        setEditingId(null);
        setAnnouncementTitle('');
        setEditorContent('');
        toast.success(editingId ? 'Announcement updated successfully' : 'Announcement created successfully');
      } else {
        toast.error('Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAnnouncements(); // Refresh the list
        toast.success('Announcement deleted successfully');
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setAnnouncementTitle('');
    setEditorContent('');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Announcements and News</h2>
        {isAdmin && !isEditing && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <MdAdd className="w-4 h-4" />
            Add Announcement
          </button>
        )}
      </div>

      {/* Editor */}
      {isEditing && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter announcement title"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Editor
              value={editorContent}
              onEditorChange={(content) => setEditorContent(content)}
              height={300}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <MdSave className="w-4 h-4" />
              {saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <MdCancel className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdAnnouncement className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500 mb-4">
              {isAdmin 
                ? 'Create your first announcement to keep students informed.'
                : 'Announcements will appear here when available.'
              }
            </p>
            {isAdmin && (
              <button
                onClick={handleAddNew}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add First Announcement
              </button>
            )}
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <div key={`announcement-${announcement.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {formatDate(announcement.updatedAt || announcement.createdAt)}
              </p>
              <div 
                className="prose max-w-none tinymce-content"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsNews;