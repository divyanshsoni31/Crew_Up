import { motion } from "motion/react";
import { Calendar, Users, Star, Plus, TrendingUp, Eye, QrCode } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMins = Math.floor(diffInSeconds / 60);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    activeEvents: 0,
    totalApplications: 0,
    recentActivity: [] as { text: string; time: string }[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("crewup_token");
        const url = `http://${window.location.hostname}:3000/api/events/organizer/dashboard`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    if (user?.role === "organizer") {
      fetchStats();
    }
  }, [user]);

  const stats = [
    { label: "Active Events", value: dashboardData.activeEvents.toString(), icon: Calendar, color: "from-violet-500 to-fuchsia-500" },
    { label: "Total Applications", value: dashboardData.totalApplications.toString(), icon: Users, color: "from-fuchsia-500 to-pink-500" },
    { label: "Rating", value: user?.rating ? user.rating.toFixed(1) : "4.9", icon: Star, color: "from-pink-500 to-orange-400" },
  ];

  const quickActions = [
    {
      title: "Create New Event",
      description: "Post a new event and start recruiting volunteers",
      icon: Plus,
      path: "/organizer/create-event",
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "View My Events",
      description: "Manage your posted events and track progress",
      icon: Calendar,
      path: "/organizer/events",
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      title: "Review Applications",
      description: "Check pending volunteer applications",
      icon: Users,
      path: "/organizer/applications",
      color: "from-emerald-400 to-teal-500",
    },
    {
      title: "Scan Event QR",
      description: "Scan volunteer tickets for check-in and feedback",
      icon: QrCode,
      path: "/organizer/scan",
      color: "from-orange-400 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-16 shadow-lg shadow-fuchsia-500/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-violet-100 font-medium">Here's what's happening with your events</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[1.5rem] p-4 shadow-lg border border-gray-100"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-2`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => navigate(action.path)}
                className="w-full bg-white rounded-[1.5rem] p-5 shadow-sm hover:shadow-lg hover:shadow-fuchsia-500/10 transition-all text-left border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-5 shadow-sm mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity yet.</p>
            )}
          </div>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 rounded-[2rem] p-8 text-white text-center mb-6 shadow-xl shadow-fuchsia-900/20"
        >
          <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Need More Volunteers?</h3>
          <p className="text-violet-100 mb-6 font-medium">Create a new event and reach thousands of skilled volunteers</p>
          <button
            onClick={() => navigate("/organizer/create-event")}
            className="bg-white text-fuchsia-600 px-8 py-3.5 rounded-full font-bold hover:shadow-lg transition-all"
          >
            Create Event
          </button>
        </motion.div>
      </div>
    </div>
  );
}
