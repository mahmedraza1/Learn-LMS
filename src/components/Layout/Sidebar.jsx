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
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <MdVideocam className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Learn LMS</h1>
            <p className="text-xs text-slate-400">Education Platform</p>
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
                    ? 'bg-emerald-500 text-white shadow-lg'
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
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-400 capitalize truncate">
              {user?.role || 'Student'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;