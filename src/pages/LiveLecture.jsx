import React from "react";
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin, selectIsStudent } from "../store/slices/authSlice";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

const LiveLecture = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStudent = useAppSelector(selectIsStudent);

  // Admin/Instructor view
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Student with assigned batch
  if (isStudent && user?.batch && user.batch !== "Unassigned") {
    return <StudentDashboard />;
  }

  // Fallback view for unknown roles
  return (
    <div className="p-4">
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        <h2 className="mb-2 text-lg font-semibold">Access Denied</h2>
        <p>
          You don't have permission to access the Live Lecture feature. 
          Please contact support for assistance.
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
};

export default LiveLecture;