import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaQuestionCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/reduxHooks';
import FAQForm from '../FAQForm';
import FAQCard from '../FAQCard';
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

const QNA = ({ course }) => {
  // Call hooks with fallback values (same pattern as other components)
  const authData = useAuth() || { user: null, isAdmin: false };

  // Safely destructure with defaults
  const user = authData?.user || null;
  const isAdmin = authData?.isAdmin || false;

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [faqForm, setFaqForm] = useState({
    isOpen: false,
    faq: null
  });

  // Fetch FAQs from API or localStorage
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      
      // First, try to load fresh data from server API
      try {
        const response = await axios.get(`${API_BASE_URL}/faqs/${course.id}`);
        const freshFaqs = response.data || [];
        setFaqs(freshFaqs);
        // Update localStorage with fresh data
        localStorage.setItem(`faqs-${course.id}`, JSON.stringify(freshFaqs));
        return;
      } catch (apiError) {
        console.warn('API endpoint not available, trying static file');
      }

      // If API fails, try to load from server data file
      try {
        const response = await fetch('/server/data/faqs.json');
        if (response.ok) {
          const data = await response.json();
          const courseFaqs = data[course.id.toString()] || [];
          setFaqs(courseFaqs);
          // Store in localStorage for future use
          localStorage.setItem(`faqs-${course.id}`, JSON.stringify(courseFaqs));
          return;
        }
      } catch (fetchError) {
        console.warn('Error loading FAQs from data file:', fetchError);
      }

      // Fallback: try localStorage
      const stored = localStorage.getItem(`faqs-${course.id}`);
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setFaqs(parsedData);
          return;
        } catch (parseError) {
          console.warn('Error parsing stored FAQs:', parseError);
        }
      }

      // Final fallback: empty array
      setFaqs([]);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      // Clear any stale localStorage data first
      localStorage.removeItem(`faqs-${course.id}`);
      fetchFaqs();
    }
  }, [course?.id]);

  // Manual refresh function
  const handleRefresh = () => {
    localStorage.removeItem(`faqs-${course.id}`);
    fetchFaqs();
  };

  // Handle adding new FAQ
  const handleAddFaq = () => {
    if (!isAdmin) return;
    setFaqForm({
      isOpen: true,
      faq: null
    });
  };

  // Handle editing FAQ
  const handleEditFaq = (faq) => {
    if (!isAdmin) return;
    setFaqForm({
      isOpen: true,
      faq
    });
  };

  // Handle deleting FAQ
  const handleDeleteFaq = async (faq) => {
    if (!isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete this FAQ: "${faq.question}"?`)) {
      return;
    }

    try {
      // Try API call first
      try {
        await axios.delete(`${API_BASE_URL}/faqs/${faq.id}`);
      } catch (error) {
        console.warn('API delete failed, using local storage');
      }
      
      // Update local state and localStorage
      const updatedFaqs = faqs.filter(f => f.id !== faq.id);
      setFaqs(updatedFaqs);
      localStorage.setItem(`faqs-${course.id}`, JSON.stringify(updatedFaqs));
      toast.success('FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (faqData) => {
    try {
      let updatedFaqs;
      
      if (faqForm.faq) {
        // Update existing FAQ
        const faqId = faqForm.faq.id;
        
        try {
          await axios.put(`${API_BASE_URL}/faqs/${faqId}`, faqData);
        } catch (error) {
          console.warn('API update failed, using local storage');
        }
        
        updatedFaqs = faqs.map(f => 
          f.id === faqId ? { ...f, ...faqData, id: faqId } : f
        );
        toast.success('FAQ updated successfully');
      } else {
        // Add new FAQ - follow standard format
        const newFaq = {
          ...faqData,
          id: Date.now() // Simple ID generation
        };
        
        try {
          const response = await axios.post(`${API_BASE_URL}/faqs/${course.id}`, newFaq);
          if (response.data?.id) {
            newFaq.id = response.data.id;
          }
        } catch (error) {
          console.warn('API create failed, using local storage');
        }
        
        updatedFaqs = [...faqs, newFaq];
        toast.success('FAQ added successfully');
      }
      
      setFaqs(updatedFaqs);
      localStorage.setItem(`faqs-${course.id}`, JSON.stringify(updatedFaqs));
      
      // Force refresh the data to ensure consistency
      setTimeout(() => {
        fetchFaqs();
      }, 500);
      
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
      throw error;
    }
  };

  // Filter FAQs based on search term and selected category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && faq.category === selectedCategory;
  });

  // Get available categories for filter
  const availableCategories = [...new Set(faqs.map(faq => faq.category))];

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
                        <FaQuestionCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
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
                onClick={handleAddFaq}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add FAQ
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
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <FaQuestionCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {faqs.length === 0 ? 'No FAQs Available' : 'No FAQs Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {faqs.length === 0 
                ? 'There are no frequently asked questions for this course yet.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {isAdmin && faqs.length === 0 && (
              <button
                onClick={handleAddFaq}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add First FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                onEdit={handleEditFaq}
                onDelete={handleDeleteFaq}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAQ Form Modal */}
      <FAQForm
        isOpen={faqForm.isOpen}
        onClose={() => setFaqForm({ isOpen: false, faq: null })}
        onSubmit={handleFormSubmit}
        faq={faqForm.faq}
        courseId={course?.id}
      />
    </div>
  );
};

export default QNA;