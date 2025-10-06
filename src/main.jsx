/*
 * Learn LMS - Application Entry Point
 * Developed by Mark for Learn.pk
 * Copyright (c) 2025 Mark. All rights reserved.
 * Proprietary software - Unauthorized use prohibited
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css' // Ensure App.css is imported here as well
import React from 'react'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="bottom-right" />
    </Provider>
  </StrictMode>,
)
