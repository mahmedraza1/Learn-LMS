import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBook, 
  MdVideocam, 
  MdGroup,
  MdReceipt
} from 'react-icons/md';
import { useAppSelector } from '../../store/hooks';
import { selectIsAdmin } from '../../store/slices/authSlice';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAppSelector(selectIsAdmin);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <MdDashboard className="w-6 h-6" />
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: <MdBook className="w-6 h-6" />
    },
    {
      name: 'Live Lecture',
      path: '/live-lecture',
      icon: <MdVideocam className="w-6 h-6" />
    },
    {
      name: 'Groups',
      path: '/groups',
      icon: <MdGroup className="w-6 h-6" />
    },
    // Only show Fee Proofs for students
    ...(!isAdmin ? [{
      name: 'Fee',
      path: '/fee-proofs',
      icon: <MdReceipt className="w-6 h-6" />
    }] : [])
  ];

  const isActivePath = (path) => {
    // Special case for courses - highlight if on any course-related route
    if (path === '/courses') {
      return location.pathname === '/courses' || location.pathname.startsWith('/course');
    }
    return location.pathname === path;
  };

  return (
    <div className="mobile-navigation fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <nav className="flex items-center justify-around py-2 px-2">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 rounded-lg transition-all duration-200 ${
              isActivePath(item.path)
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={`mb-1 ${isActivePath(item.path) ? 'text-green-600' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            <span className={`text-xs font-medium truncate ${isActivePath(item.path) ? 'text-green-600' : 'text-gray-600'}`}>
              {item.name}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileNavigation;