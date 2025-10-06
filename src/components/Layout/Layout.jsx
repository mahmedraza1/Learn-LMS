/*
 * Learn LMS - Main Layout Component
 * Developed by Mark for Learn.pk
 * Copyright (c) 2025 Mark. All rights reserved.
 * Proprietary software - Unauthorized use prohibited
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page content with bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Layout;