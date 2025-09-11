import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://learn.pk/wp-json/custom/v1/me', {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch user data');
      
      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
      toast.error(`Authentication error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    isAdmin: user?.roles?.includes('administrator') || user?.roles?.includes('instructor'),
    isStudent: user?.roles?.includes('student'),
    isGuest: !user || user.id === 0,
    loading,
    error,
    refetch: fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
