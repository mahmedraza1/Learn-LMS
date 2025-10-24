import React from "react";
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin, selectIsStudent, selectIsUpcomingBatchStudent } from "../store/slices/authSlice";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

const LiveLecture = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStudent = useAppSelector(selectIsStudent);
  const isUpcomingBatchStudent = useAppSelector(selectIsUpcomingBatchStudent);

  // Admin/Instructor view
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Upcoming batch student - show restriction message
  if (isUpcomingBatchStudent) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg bg-green-50 border-2 border-green-200 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-green-900">Live Lectures Coming Soon!</h2>
            {/* <p className="text-lg text-green-800 mb-4">
              You are enrolled in <strong>{user.upcoming_batch?.includes("A") ? "Batch A" : user.upcoming_batch?.includes("B") ? "Batch B" : user.upcoming_batch}</strong>
            </p> */}
            <p className="text-green-700 mb-6">
              Your live lectures will be start from <b>{
                   user.upcoming_batch.includes("A") ? " 1st date of next month" : user.upcoming_batch.includes("B") ? " 15th date of this month" : "the scheduled date"
                  }</b>.<br/>
               In the meantime, you can:
            </p>
            <div className="bg-white rounded-lg p-6 text-left mb-6">
              <ul className="space-y-3 text-green-900">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📹 Watch recorded lectures</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>👥 Join Your Community Groups</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📚 Access course notes and study materials</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>❓ Review FAQs for each course</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📖 Read course overviews and announcements</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <a
                href="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Browse Courses
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
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