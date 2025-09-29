import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaFileAlt, FaDownload, FaBook } from 'react-icons/fa';
import { useAuth } from '../../hooks/reduxHooks';
import NotesForm from '../NotesForm';
import NotesCard from '../NotesCard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const Notes = ({ course }) => {
  // Call hooks with fallback values (same pattern as RecordedLectures)
  const authData = useAuth() || { user: null, isAdmin: false };

  // Safely destructure with defaults
  const user = authData?.user || null;
  const isAdmin = authData?.isAdmin || false;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notesForm, setNotesForm] = useState({
    isOpen: false,
    note: null
  });

  // Fetch notes from API or localStorage
  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      // First, try to load fresh data from server API
      try {
        const response = await axios.get(`${API_BASE_URL}/notes/${course.id}`);
        const freshNotes = response.data || [];
        setNotes(freshNotes);
        // Update localStorage with fresh data
        localStorage.setItem(`notes-${course.id}`, JSON.stringify(freshNotes));
        return;
      } catch (apiError) {
        console.warn('API endpoint not available, trying static file');
      }

      // If API fails, try to load from server data file
      try {
        const response = await fetch('/server/data/notes.json');
        if (response.ok) {
          const data = await response.json();
          const courseNotes = data[course.id.toString()] || [];
          setNotes(courseNotes);
          // Store in localStorage for future use
          localStorage.setItem(`notes-${course.id}`, JSON.stringify(courseNotes));
          return;
        }
      } catch (fetchError) {
        console.warn('Error loading notes from data file:', fetchError);
      }

      // Fallback: try localStorage
      const stored = localStorage.getItem(`notes-${course.id}`);
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setNotes(parsedData);
          return;
        } catch (parseError) {
          console.warn('Error parsing stored notes:', parseError);
        }
      }

      // Final fallback: empty array
      setNotes([]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      // Clear any stale localStorage data first
      localStorage.removeItem(`notes-${course.id}`);
      fetchNotes();
    }
  }, [course?.id]);

  // Manual refresh function
  const handleRefresh = () => {
    localStorage.removeItem(`notes-${course.id}`);
    fetchNotes();
  };

  // Handle adding new note
  const handleAddNote = () => {
    if (!isAdmin) return;
    setNotesForm({
      isOpen: true,
      note: null
    });
  };

  // Handle editing note
  const handleEditNote = (note) => {
    if (!isAdmin) return;
    setNotesForm({
      isOpen: true,
      note
    });
  };

  // Handle deleting note
  const handleDeleteNote = async (note) => {
    if (!isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete "${note.fileName}"?`)) {
      return;
    }

    try {
      // Try API call first
      try {
        await axios.delete(`${API_BASE_URL}/notes/${note.id}`);
      } catch (error) {
        console.warn('API delete failed, using local storage');
      }
      
      // Update local state and localStorage
      const updatedNotes = notes.filter(n => n.id !== note.id);
      setNotes(updatedNotes);
      localStorage.setItem(`notes-${course.id}`, JSON.stringify(updatedNotes));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (noteData) => {
    try {
      let updatedNotes;
      
      if (notesForm.note) {
        // Update existing note
        const noteId = notesForm.note.id;
        
        try {
          await axios.put(`${API_BASE_URL}/notes/${noteId}`, noteData);
        } catch (error) {
          console.warn('API update failed, using local storage');
        }
        
        updatedNotes = notes.map(n => 
          n.id === noteId ? { ...n, ...noteData, id: noteId } : n
        );
        toast.success('Note updated successfully');
      } else {
        // Add new note - follow standard format without course_id in note object
        const newNote = {
          ...noteData,
          id: Date.now() // Simple ID generation
        };
        
        try {
          const response = await axios.post(`${API_BASE_URL}/notes/${course.id}`, newNote);
          if (response.data?.id) {
            newNote.id = response.data.id;
          }
        } catch (error) {
          console.warn('API create failed, using local storage');
        }
        
        updatedNotes = [...notes, newNote];
        toast.success('Note added successfully');
      }
      
      setNotes(updatedNotes);
      localStorage.setItem(`notes-${course.id}`, JSON.stringify(updatedNotes));
      
      // Force refresh the data to ensure consistency
      setTimeout(() => {
        fetchNotes();
      }, 500);
      
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
      throw error;
    }
  };

  // Filter notes based on search term and selected filter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (selectedFilter === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && note.fileType === selectedFilter;
  });

  // Get available file types for filter
  const availableFileTypes = [...new Set(notes.map(note => note.fileType))];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FaBook className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Course Notes</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              🔄 Refresh
            </button>
            {isAdmin && (
              <button
                onClick={handleAddNote}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Note
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {availableFileTypes.map(type => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0 ? 'No Notes Available' : 'No Notes Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {notes.length === 0 
                ? 'There are no notes for this course yet.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {isAdmin && notes.length === 0 && (
              <button
                onClick={handleAddNote}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <NotesCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notes Form Modal */}
      <NotesForm
        isOpen={notesForm.isOpen}
        onClose={() => setNotesForm({ isOpen: false, note: null })}
        onSubmit={handleFormSubmit}
        note={notesForm.note}
        courseId={course?.id}
      />
    </div>
  );
};

export default Notes;