import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css' // Ensure App.css is imported here as well
import React from 'react'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { BatchProvider } from './contexts/BatchContext'
import { LectureProvider } from './contexts/LectureContext'
import { AnnouncementProvider } from './contexts/AnnouncementContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BatchProvider>
        <LectureProvider>
          <AnnouncementProvider>
            <App />
            <Toaster position="bottom-right" />
          </AnnouncementProvider>
        </LectureProvider>
      </BatchProvider>
    </AuthProvider>
  </StrictMode>,
)
