import React, { useState, useEffect } from "react";
import { MdSchool, MdLiveTv, MdGroup, MdPerson } from "react-icons/md";

// Determine API URL based on hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
    return 'https://lms.learn.pk/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const DashboardStats = ({ user, isAdmin = false }) => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    liveClassesCount: 0,
    totalBatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard-stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Get student status text
  const getStudentStatus = () => {
    if (user?.admission_status === 'Trial') {
      const daysLeft = user?.days_left_in_trial || 0;
      return `Trial (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'})`;
    }
    return 'Active';
  };

  const statCards = isAdmin ? [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: MdSchool,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Live Classes",
      value: stats.liveClassesCount,
      icon: MdLiveTv,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700"
    },
    {
      title: "Total Batches",
      value: stats.totalBatches,
      icon: MdGroup,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Admin Panel",
      value: "Active",
      icon: MdPerson,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ] : [
    {
      title: "My Batch",
      value: user.batch || "Not Assigned",
      icon: MdGroup,
      color: "bg-[#0D7C66]",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Live Classes",
      value: stats.liveClassesCount,
      icon: MdLiveTv,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700"
    },
    {
      title: "Available Courses",
      value: stats.totalCourses,
      icon: MdSchool,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Student Profile",
      value: getStudentStatus(),
      icon: MdPerson,
      color: user?.admission_status === 'Trial' ? "bg-amber-500" : "bg-indigo-500",
      bgColor: user?.admission_status === 'Trial' ? "bg-amber-50" : "bg-indigo-50",
      textColor: user?.admission_status === 'Trial' ? "text-amber-700" : "text-indigo-700"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24 mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className={`${card.bgColor} rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{card.title}</p>
                <p className={`text-xl sm:text-2xl font-bold ${card.textColor} truncate`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} text-white p-2 sm:p-3 rounded-full flex-shrink-0`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;