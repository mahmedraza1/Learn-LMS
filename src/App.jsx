// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import React from "react";
import { useAuth } from "./contexts/AuthContext";
import { useBatch } from "./contexts/BatchContext";
import GuestView from "./pages/GuestView";
import StudentPendingView from "./pages/StudentPendingView";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user, isAdmin, isStudent, isGuest, loading } = useAuth();
  const { selectedBatch } = useBatch();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Guest view
  if (isGuest) {
    return <GuestView />;
  }

  // Student with unassigned batch
  if (isStudent && user?.batch === "Unassigned") {
    return <StudentPendingView />;
  }

  // Student with assigned batch
  if (isStudent && user?.batch && user.batch !== "Unassigned") {
    return <StudentDashboard />;
  }

  // Admin/Instructor view
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Fallback view for unknown roles
  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        <h2 className="mb-2 text-lg font-semibold">Unknown User Role</h2>
        <p>
          Your account type is not recognized. Please contact support for assistance.
        </p>
        <div className="mt-3">
          <p className="text-sm">
            📧 contact@learn.pk<br />
            📱 WhatsApp: +923177569038
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;