import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaBullhorn, FaEdit, FaTrash, FaDownload, FaUpload, FaDatabase } from 'react-icons/fa';
import { MdClose, MdAdd } from 'react-icons/md';
import parse from 'html-react-parser';
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin } from "../store/slices/authSlice";
import DashboardStats from '../components/DashboardStats';
import DashboardVideoSection from '../components/DashboardVideoSection';
import VideoManagementForm from '../components/VideoManagementForm';
import RTE from '../components/RTE';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [videoManagementOpen, setVideoManagementOpen] = useState(false);
  const [dashboardAnnouncement, setDashboardAnnouncement] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showJsonManager, setShowJsonManager] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  // const [quranVerse, setQuranVerse] = useState(null);
  // const [loadingVerse, setLoadingVerse] = useState(false);
  // const [audioPlaying, setAudioPlaying] = useState(false);
  // const [audioError, setAudioError] = useState(false);
  // const [currentAudio, setCurrentAudio] = useState(null);

  // React Hook Form setup for dashboard announcement
  const { control, handleSubmit, reset, register, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      author: 'Learn pk'
    }
  });

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return { greeting: "Good Morning", emoji: "🌅" };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: "Good Afternoon", emoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: "Good Evening", emoji: "🌇" };
    } else {
      return { greeting: "Good Night", emoji: "🌙" };
    }
  };

  const { greeting, emoji } = getTimeBasedGreeting();

  // Surah ayah count data
  // const surahAyahCount = {
  //   1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  //   11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  //   21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  //   31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  //   41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  //   51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  //   61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  //   71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  //   81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  //   91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  //   101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  //   111: 5, 112: 4, 113: 5, 114: 6
  // };

  // Fetch random Quran verse
  // const fetchRandomQuranVerse = async () => {
  //   try {
  //     setLoadingVerse(true);
  //     
  //     // Generate random surah number (1-114)
  //     const randomSurah = Math.floor(Math.random() * 114) + 1;
  //     
  //     // Generate random ayah number based on surah
  //     const maxAyah = surahAyahCount[randomSurah];
  //     const randomAyah = Math.floor(Math.random() * maxAyah) + 1;
  //     
  //     const url = `https://quranapi.pages.dev/api/${randomSurah}/${randomAyah}.json`;
  //     const response = await fetch(url);
  //     
  //     if (response.ok) {
  //       const verseData = await response.json();
  //       setQuranVerse(verseData);
  //     } else {
  //       console.error('Failed to fetch Quran verse');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching Quran verse:', error);
  //   } finally {
  //     setLoadingVerse(false);
  //   }
  // };

  // Determine API URL based on hostname
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
      return 'https://lms.learn.pk/api';
    }
    return 'http://localhost:3001/api';
  };

  const API_BASE_URL = getApiBaseUrl();

  // Fetch dashboard announcement
  const fetchDashboardAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`);
      if (response.ok) {
        const data = await response.json();
        setDashboardAnnouncement(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save dashboard announcement
  const saveDashboardAnnouncement = async (data) => {
    try {
      setLoading(true);
      const announcementData = {
        ...data,
        id: dashboardAnnouncement?.id || Date.now(),
        date: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const savedAnnouncement = await response.json();
        setDashboardAnnouncement(savedAnnouncement);
        toast.success('Dashboard announcement saved successfully!');
        setShowAnnouncementForm(false);
        reset();
      } else {
        toast.error('Failed to save dashboard announcement');
      }
    } catch (error) {
      console.error('Error saving dashboard announcement:', error);
      toast.error('Error saving dashboard announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete dashboard announcement
  const deleteDashboardAnnouncement = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard-announcement`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDashboardAnnouncement(null);
        toast.success('Dashboard announcement deleted successfully!');
      } else {
        toast.error('Failed to delete dashboard announcement');
      }
    } catch (error) {
      console.error('Error deleting dashboard announcement:', error);
      toast.error('Error deleting dashboard announcement');
    } finally {
      setLoading(false);
    }
  };

  // Download all JSON files
  const downloadAllJsonFiles = async () => {
    if (!confirm('This will download all JSON data files as a ZIP archive. Continue?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/download-all-json`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learn-lms-data-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('JSON files downloaded successfully!');
      } else {
        toast.error('Failed to download JSON files');
      }
    } catch (error) {
      console.error('Error downloading JSON files:', error);
      toast.error('Error downloading JSON files');
    } finally {
      setLoading(false);
    }
  };

  // Upload JSON files
  const uploadJsonFiles = async (files) => {
    try {
      setUploadingFiles(true);
      const formData = new FormData();
      
      for (let file of files) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          formData.append('jsonFiles', file);
        } else {
          toast.error(`File ${file.name} is not a JSON file`);
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/upload-json-files`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully uploaded ${result.uploadedCount} JSON files`);
        if (result.replacedFiles.length > 0) {
          setTimeout(() => {
            toast(`Replaced existing files: ${result.replacedFiles.join(', ')}`, {
              icon: '🔄',
              duration: 4000,
            });
          }, 1000);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload JSON files');
      }
    } catch (error) {
      console.error('Error uploading JSON files:', error);
      toast.error('Error uploading JSON files');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle file input change
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Validate file types before uploading
      const invalidFiles = files.filter(file => !file.type.includes('json') && !file.name.endsWith('.json'));
      if (invalidFiles.length > 0) {
        toast.error(`Please select only JSON files. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
        event.target.value = '';
        return;
      }
      
      // Confirm upload if there are multiple files
      if (files.length > 1) {
        const confirm = window.confirm(`Are you sure you want to upload ${files.length} JSON files? This will replace any existing files with the same names.`);
        if (!confirm) {
          event.target.value = '';
          return;
        }
      }
      
      uploadJsonFiles(files);
    }
    // Clear the input
    event.target.value = '';
  };

  // Play audio function
  // const playVerseAudio = () => {
  //   if (quranVerse && quranVerse.audio && quranVerse.audio["1"]) {
  //     // Stop any currently playing audio
  //     if (currentAudio) {
  //       currentAudio.pause();
  //       currentAudio.currentTime = 0;
  //     }
  //     
  //     setAudioError(false);
  //     setAudioPlaying(true);
  //     
  //     const audioUrl = quranVerse.audio["1"].url;
  //     const audio = new Audio(audioUrl);
  //     setCurrentAudio(audio);
  //     
  //     audio.onended = () => {
  //       setAudioPlaying(false);
  //       setCurrentAudio(null);
  //     };
  //     
  //     audio.onerror = () => {
  //       setAudioError(true);
  //       setAudioPlaying(false);
  //       setCurrentAudio(null);
  //       toast.error('Failed to load audio');
  //     };
  //     
  //     audio.play().catch((error) => {
  //       setAudioError(true);
  //       setAudioPlaying(false);
  //       setCurrentAudio(null);
  //       toast.error('Failed to play audio');
  //       console.error('Audio play error:', error);
  //     });
  //   }
  // };

  // Load dashboard announcement and Quran verse on component mount
  useEffect(() => {
    fetchDashboardAnnouncement();
    // fetchRandomQuranVerse();
  }, []);

  // Reset audio state when verse changes
  // useEffect(() => {
  //   // Stop any currently playing audio when verse changes
  //   if (currentAudio) {
  //     currentAudio.pause();
  //     currentAudio.currentTime = 0;
  //   }
  //   setAudioPlaying(false);
  //   setAudioError(false);
  //   setCurrentAudio(null);
  // }, [quranVerse]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {isAdmin ? 'Admin Dashboard' : 'Learn LMS'}
              </h1>
              <p className="mt-1 text-sm sm:text-base lg:text-lg text-gray-600 truncate">
                {greeting}, {user?.name || 'User'}! {emoji}
              </p>
            </div>
            {!isAdmin && user?.batch && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 sm:px-4 py-1 sm:py-2 text-sm font-medium text-emerald-800">
                  {user.batch}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quran Verse Section - Commented Out */}
      {/*
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
        {loadingVerse ? (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-4 sm:p-6">
            <div className="text-center mb-4">
              <div 
                className="text-xl sm:text-2xl text-emerald-700 mb-3"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                dir="rtl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading verse...</span>
            </div>
          </div>
        ) : quranVerse ? (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-4 sm:p-6">
            <div className="text-center mb-6">
              <div 
                className="text-xl sm:text-2xl text-emerald-700 mb-4"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                dir="rtl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 text-lg">📖</span>
                <h3 className="text-sm font-medium text-gray-800">
                  {quranVerse.surahNameTranslation} ({quranVerse.surahName}) - Verse {quranVerse.ayahNo}
                </h3>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end gap-2">
                {quranVerse.audio && quranVerse.audio["1"] && (
                  <button
                    onClick={playVerseAudio}
                    disabled={audioPlaying}
                    className={`text-xs px-3 py-1 rounded-full transition-colors flex-shrink-0 flex items-center gap-1 ${
                      audioPlaying 
                        ? 'bg-orange-500 text-white cursor-not-allowed' 
                        : audioError 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {audioPlaying ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        Playing
                      </>
                    ) : (
                      <>
                        🔊 Play Audio
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={fetchRandomQuranVerse}
                  className="text-xs px-3 py-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  New Verse
                </button>
              </div>
            </div>
            
            <div 
              className="text-right mb-4 text-lg sm:text-xl leading-relaxed text-gray-800"
              style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
              dir="rtl"
            >
              {quranVerse.arabic1}
            </div>
            
            <div 
              className="mb-3 text-sm sm:text-base leading-relaxed text-gray-700"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              <span className="font-medium text-gray-800">English:</span> {quranVerse.english}
            </div>
            
            <div 
              className="text-sm sm:text-base leading-relaxed text-gray-700"
              style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              dir="rtl"
            >
              <span className="font-medium text-gray-800" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} dir="rtl">اردو:</span> {quranVerse.urdu}
            </div>
            
            <div className="mt-4 pt-3 border-t border-emerald-200 text-xs text-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="font-medium text-center sm:text-left">Let your path of learning open with words from the Al-Quran</span>
              
              <div className="flex justify-center">
                <a 
                  href={`https://quranapi.pages.dev/api/${quranVerse.surahNo}/${quranVerse.ayahNo}.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full hover:bg-emerald-200 hover:border-emerald-300 transition-colors duration-200 cursor-pointer"
                >
                  <span className="text-xs text-emerald-700 font-medium">
                    📡 Source: quranapi.pages.dev
                  </span>
                </a>
              </div>
              
              <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                <span className="font-medium">Surah {quranVerse.surahNo}:</span>
                <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} dir="rtl">{quranVerse.surahNameArabic}</span>
                <span>•</span>
                <span>Revealed in {quranVerse.revelationPlace}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Dashboard Statistics */}
        <DashboardStats user={user} isAdmin={isAdmin} />
        
        {/* Dashboard Announcement Section */}
        {(dashboardAnnouncement || isAdmin) && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <FaBullhorn className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Dashboard Announcement</h2>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    {dashboardAnnouncement && (
                      <button
                        onClick={() => {
                          reset({
                            title: dashboardAnnouncement.title || '',
                            content: dashboardAnnouncement.content || '',
                            author: 'Learn pk'
                          });
                          setShowAnnouncementForm(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                    {!dashboardAnnouncement && (
                      <button
                        onClick={() => setShowAnnouncementForm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <MdAdd className="w-4 h-4" />
                        Add Announcement
                      </button>
                    )}
                    {dashboardAnnouncement && (
                      <button
                        onClick={deleteDashboardAnnouncement}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              {dashboardAnnouncement ? (
                <div>
                  {dashboardAnnouncement.title && (
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {dashboardAnnouncement.title}
                    </h3>
                  )}
                  <div 
                    className="prose max-w-none tinymce-content text-gray-700"
                    dangerouslySetInnerHTML={{ __html: dashboardAnnouncement.content }}
                  />
                  <div className="mt-4 text-xs text-gray-500">
                    By Learn pk • {new Date(dashboardAnnouncement.updatedAt || dashboardAnnouncement.date).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBullhorn className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No dashboard announcement available.</p>
                  {isAdmin && (
                    <p className="text-sm mt-1">Click "Add Announcement" to create one.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* JSON Data Management Section - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <FaDatabase className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
                    <p className="text-sm text-gray-600">Download or upload JSON data files</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={downloadAllJsonFiles}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <FaDownload className="w-4 h-4" />
                    {loading ? 'Downloading...' : 'Download All Data'}
                  </button>
                  <div className="relative">
                    <input
                      type="file"
                      id="jsonFileUpload"
                      multiple
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="jsonFileUpload"
                      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FaUpload className="w-4 h-4" />
                      {uploadingFiles ? 'Uploading...' : 'Upload JSON Files'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Data Management Instructions:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Download:</strong> Creates a ZIP file containing all current JSON data files</li>
                    <li><strong>Upload:</strong> Select one or more JSON files to upload. Existing files with the same name will be replaced</li>
                    <li><strong>Supported files:</strong> courses.json, lectures.json, notes.json, faqs.json, groups.json, etc.</li>
                    <li><strong>Backup recommended:</strong> Always download current data before uploading new files</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Video Section */}
        <DashboardVideoSection isAdmin={isAdmin} />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              {isAdmin ? (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Manage Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Live Lectures
                  </a>
                  <button 
                    onClick={() => setVideoManagementOpen(true)}
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base"
                  >
                    Manage Videos
                  </button>
                </>
              ) : (
                <>
                  <a href="/courses" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    Browse Courses
                  </a>
                  <a href="/live-lecture" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg text-center transition-colors text-sm sm:text-base">
                    My Classes
                  </a>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
            <div className="text-sm text-gray-600">
              <p>No recent activity to display.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notifications</h3>
            <div className="text-sm text-gray-600">
              <p>No new notifications.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Announcement Form Modal */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaBullhorn className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {dashboardAnnouncement ? 'Edit Dashboard Announcement' : 'Add Dashboard Announcement'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAnnouncementForm(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit(saveDashboardAnnouncement)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter announcement title..."
                />
              </div>
              
              <div>
                <RTE
                  name="content"
                  control={control}
                  label="Content *"
                  defaultValue=""
                  rules={{ required: 'Content is required' }}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-red-500">Content is required</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : (dashboardAnnouncement ? 'Update Announcement' : 'Save Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Video Management Modal */}
      {isAdmin && (
        <VideoManagementForm 
          isOpen={videoManagementOpen} 
          onClose={() => setVideoManagementOpen(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;