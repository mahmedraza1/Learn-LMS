import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBook, 
  MdVideocam, 
  MdGroup 
} from 'react-icons/md';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

// Helper function to get display role from roles array
const getDisplayRole = (roles) => {
  if (!roles || !Array.isArray(roles)) return 'Student';
  
  if (roles.includes('administrator')) return 'Administrator';
  if (roles.includes('instructor')) return 'Instructor';
  if (roles.includes('student')) return 'Student';
  
  return 'Student'; // Default fallback
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <MdDashboard className="w-5 h-5" />
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: <MdBook className="w-5 h-5" />
    },
    {
      name: 'Live Lecture',
      path: '/live-lecture',
      icon: <MdVideocam className="w-5 h-5" />
    },
    {
      name: 'Groups',
      path: '/groups',
      icon: <MdGroup className="w-5 h-5" />
    }
  ];

  const isActivePath = (path) => {
    // Special case for courses - highlight if on any course-related route
    if (path === '/courses') {
      return location.pathname === '/courses' || location.pathname.startsWith('/course');
    }
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex w-64 bg-slate-800 text-white min-h-screen flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0D7C66] rounded-lg flex items-center justify-center">
            <img src="/dash.png" alt="Logo" className="w-9 h-9 bg-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Learn.pk</h1>
            <p className="text-xs text-slate-400">Future of Pakistan</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-[#0D7C66] text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className={isActivePath(item.path) ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0D7C66] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {getDisplayRole(user?.roles)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;