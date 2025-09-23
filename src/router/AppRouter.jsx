import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthWrapper from '../components/AuthWrapper';
import Layout from '../components/Layout/Layout';
import Dashboard from '../pages/Dashboard';
import Courses from '../pages/Courses';
import LiveLecture from '../pages/LiveLecture';
import Groups from '../pages/Groups';

const AppRouter = () => {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="live-lecture" element={<LiveLecture />} />
            <Route path="groups" element={<Groups />} />
          </Route>
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
};

export default AppRouter;