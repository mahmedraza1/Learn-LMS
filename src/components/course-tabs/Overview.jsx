import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectIsAdmin } from '../../store/slices/authSlice';
import { MdEdit, MdSave, MdCancel } from 'react-icons/md';
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

const Overview = ({ course }) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const [overview, setOverview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch course overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}/overview`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOverview(data.content || '');
    } catch (error) {
      console.error('Error fetching overview:', error);
      toast.error('Failed to load overview');
      setOverview(''); // Set empty content on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      fetchOverview();
    }
  }, [course?.id]);

  // Handle edit button click
  const handleEditClick = () => {
    setEditorContent(overview);
    setIsEditing(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}/overview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editorContent }),
      });

      if (response.ok) {
        setOverview(editorContent);
        setIsEditing(false);
        toast.success('Overview saved successfully');
      } else {
        const errorText = await response.text();
        console.error('Save error:', errorText);
        toast.error('Failed to save overview');
      }
    } catch (error) {
      console.error('Error saving overview:', error);
      toast.error('Failed to save overview');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditorContent('');
    setIsEditing(false);
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
        <h2 className="text-2xl font-bold text-gray-900">Course Overview</h2>
        {isAdmin && !isEditing && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <MdEdit className="w-4 h-4" />
            {overview ? 'Edit Overview' : 'Add Overview'}
          </button>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div>
          <Editor
            value={editorContent}
            onEditorChange={(content) => setEditorContent(content)}
            height={400}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <MdSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Overview'}
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
      ) : (
        <div>
          {overview ? (
            <div 
              className="prose max-w-none tinymce-content"
              dangerouslySetInnerHTML={{ __html: overview }}
              style={{
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdEdit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Overview Available</h3>
              <p className="text-gray-500 mb-4">
                {isAdmin 
                  ? 'Add a comprehensive overview to help students understand what this course covers.'
                  : 'The course overview will be available soon.'
                }
              </p>
              {isAdmin && (
                <button
                  onClick={handleEditClick}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Add Overview
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Overview;