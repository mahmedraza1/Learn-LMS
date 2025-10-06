import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaFileAlt, FaImage, FaFile } from 'react-icons/fa';

const NotesForm = ({ isOpen, onClose, onSubmit, note, courseId }) => {
  const [formData, setFormData] = useState({
    fileName: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
    fileSize: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        fileName: note.fileName || '',
        description: note.description || '',
        fileUrl: note.fileUrl || '',
        fileType: note.fileType || 'pdf',
        fileSize: note.fileSize || '',
        tags: note.tags || []
      });
    } else {
      // Reset form for new note
      setFormData({
        fileName: '',
        description: '',
        fileUrl: '',
        fileType: 'pdf',
        fileSize: '',
        tags: []
      });
    }
  }, [note, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const detectFileType = (url) => {
    if (!url) return 'pdf';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.pdf') || lowerUrl.includes('pdf')) return 'pdf';
    if (lowerUrl.includes('.png') || lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.gif') || lowerUrl.includes('image')) return 'image';
    if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) return 'document';
    return 'pdf'; // default
  };

  const handleFileUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      fileUrl: url,
      fileType: detectFileType(url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fileName.trim() || !formData.fileUrl.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
                  const noteData = {
        fileName: formData.fileName,
        description: formData.description,
        fileUrl: formData.fileUrl,
        fileType: formData.fileType,
        fileSize: formData.fileSize,
        uploadedBy: 'Learn.pk',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        id: note?.id || Date.now()
      };

      await onSubmit(noteData);
      onClose();
    } catch (error) {
      console.error('Error submitting note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFileAlt className="w-5 h-5 text-red-500" />;
      case 'image':
        return <FaImage className="w-5 h-5 text-green-500" />;
      default:
        return <FaFile className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-xl bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? 'Edit Note' : 'Add New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Name */}
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
              File Name *
            </label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              value={formData.fileName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter file name"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter file description"
            />
          </div>

          {/* File URL */}
          <div>
            <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-2">
              File URL *
            </label>
            <input
              type="url"
              id="fileUrl"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleFileUrlChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/notes/file.pdf"
            />
          </div>

          {/* File Type & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select
                id="fileType"
                name="fileType"
                value={formData.fileType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 mb-2">
                File Size
              </label>
              <input
                type="text"
                id="fileSize"
                name="fileSize"
                value={formData.fileSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2.4 MB"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preview */}
          {formData.fileType && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-3">Preview</h4>
              <div className="flex items-center space-x-3">
                {getFileIcon(formData.fileType)}
                <div>
                  <p className="font-medium text-gray-900">{formData.fileName || 'File Name'}</p>
                  <p className="text-sm text-gray-600">{formData.fileType.toUpperCase()} • {formData.fileSize || 'Unknown size'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 bg-gray-50 rounded-b-xl px-6 py-4 -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  <span>{note ? 'Update Note' : 'Add Note'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotesForm;