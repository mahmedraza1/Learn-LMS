import React, { createContext, useState, useContext, useEffect } from 'react';

const AnnouncementContext = createContext();

export const useAnnouncement = () => useContext(AnnouncementContext);

export const AnnouncementProvider = ({ children }) => {
  const [globalAnnouncements, setGlobalAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch global announcements
  const fetchGlobalAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/global-announcements');
      if (response.ok) {
        const announcements = await response.json();
        setGlobalAnnouncements(announcements);
      }
    } catch (error) {
      console.error('Failed to fetch global announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new global announcement
  const addGlobalAnnouncement = async (announcementData) => {
    try {
      const announcement = {
        ...announcementData,
        date: new Date().toISOString(),
        id: Date.now() // Simple ID generation
      };

      const response = await fetch('http://localhost:3001/api/global-announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcement),
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        setGlobalAnnouncements(prev => [newAnnouncement, ...prev]);
        return newAnnouncement;
      } else {
        throw new Error('Failed to save announcement');
      }
    } catch (error) {
      console.error('Error adding global announcement:', error);
      throw error;
    }
  };

  // Update global announcement
  const updateGlobalAnnouncement = async (id, updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/global-announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        setGlobalAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === id ? updatedAnnouncement : announcement
          )
        );
        return updatedAnnouncement;
      } else {
        throw new Error('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating global announcement:', error);
      throw error;
    }
  };

  // Delete global announcement
  const deleteGlobalAnnouncement = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/global-announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGlobalAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
        return true;
      } else {
        throw new Error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting global announcement:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGlobalAnnouncements();
  }, []);

  const value = {
    globalAnnouncements,
    loading,
    addGlobalAnnouncement,
    updateGlobalAnnouncement,
    deleteGlobalAnnouncement,
    fetchGlobalAnnouncements
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};