import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  Calendar,
  UserCheck,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";


export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setDashboardData(data);
      } else if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crewup_token');
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        toast.error(data.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err) {
      toast.error('Server error connecting to database');
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStats = [
    {
      label: "Total Users",
      value: dashboardData?.stats?.totalUsers || "0",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Events",
      value: dashboardData?.stats?.activeEvents || "0",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Volunteers",
      value: dashboardData?.stats?.totalVolunteers || "0",
      icon: UserCheck,
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      label: "Total Organizers",
      value: dashboardData?.stats?.totalOrganizers || "0",
      icon: Shield,
      color: "from-pink-500 to-orange-400",
    },
  ];

  const recentUsers = dashboardData?.recentUsers || [];

  const pendingVerifications = dashboardData?.pendingVerifications || [];

  const handleApprove = async (id: string) => {
    try {
      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/admin/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'upcoming' })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Event approved successfully');
        fetchDashboardStats();
      } else if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crewup_token');
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        toast.error(data.message || 'Failed to approve event');
      }
    } catch (err) {
      toast.error('Server error connecting to database');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this event application?")) return;

    try {
      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/admin/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Event application rejected');
        fetchDashboardStats();
      } else if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crewup_token');
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        toast.error(data.message || 'Failed to reject event application');
      }
    } catch (err) {
      toast.error('Server error connecting to database');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">


      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening today.
          </p>
        </div>

        {/* Loading State or Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading real-time platform statistics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dynamicStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-[1rem] flex items-center justify-center shadow-md`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Users</h2>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentUsers.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => navigate('/admin/users')}
                      className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white rounded-[1.5rem] transition-colors border border-transparent hover:border-gray-100 cursor-pointer gap-2 overflow-hidden"
                    >
                      <div className="flex flex-1 items-center gap-3 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-violet-100">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-1 ${user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {user.status === "active" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {user.status}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.joined}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pending Verifications */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Pending Verifications</h2>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {pendingVerifications.length} Pending
                    </span>
                  </div>
                  {pendingVerifications.length > 3 && (
                    <button
                      onClick={() => navigate('/admin/events')}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {pendingVerifications.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No pending verifications at this time.
                    </div>
                  ) : (
                    pendingVerifications.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-2xl overflow-hidden">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium mb-1 truncate">{item.organizer}</div>
                            <div className="text-sm text-muted-foreground truncate">{item.document}</div>
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0 mt-1">{item.submitted}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 rounded-[2rem] p-8 text-white shadow-xl shadow-fuchsia-900/20"
            >
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 py-4 rounded-[1.5rem] font-medium transition-all shadow-sm border border-white/10"
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  Manage Users
                </button>
                <button
                  onClick={() => navigate('/admin/events')}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 py-4 rounded-2xl font-medium transition-all"
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  Review Events
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 py-4 rounded-2xl font-medium transition-all"
                >
                  <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                  View Reports
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
