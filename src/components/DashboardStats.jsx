import React, { useState, useEffect } from "react";
import { MdSchool, MdLiveTv, MdGroup, MdPerson } from "react-icons/md";

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
        const response = await fetch('http://localhost:3001/api/dashboard-stats');
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
      color: "bg-emerald-500",
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
      value: "Active",
      icon: MdPerson,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className={`${card.bgColor} rounded-lg shadow-sm p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-full`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;