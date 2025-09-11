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
import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Step 1: Get current WordPress user
    fetch("https://learn.pk/wp-json/custom/v1/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then((userData) => {
        if (!userData || userData.id === 0) throw new Error("Guest user");
        setUser(userData);

        // Step 2: Fetch user batches using user ID
        return fetch(
          `https://learn.pk/wp-json/wplms/v1/user-batches/${userData.id}`,
          { credentials: "include" }
        );
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user batches");
        return res.json();
      })
      .then((batchData) => {
        setBatches(batchData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>WordPress User Info</h1>
      <p>
        <strong>ID:</strong> {user.id}
      </p>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Roles:</strong> {user.roles.join(", ")}
      </p>

      <h2>User Batches</h2>
      {batches.length === 0 ? (
        <p>No batches found.</p>
      ) : (
        <ul>
          {batches.map((batch, index) => (
            <li key={index}>
              <strong>{batch.course_title}</strong> — Batch {batch.batch}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;