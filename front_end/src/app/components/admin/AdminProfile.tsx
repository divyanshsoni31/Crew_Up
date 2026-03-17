import { ArrowLeft, Shield, Users, Activity, Settings, CheckCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";

const RECENT_ACTIVITY = [
    { id: 1, action: "Approved new organization", target: "Tech Together", time: "2 hours ago" },
    { id: 2, action: "Resolved user report", target: "Report #1042", time: "5 hours ago" },
    { id: 3, action: "System update applied", target: "v2.1.0", time: "1 day ago" },
];

export function AdminProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const profile = {
        name: "Admin User",
        avatar: "👑",
        role: "Super Admin",
        status: "Active",
        location: "Global",
        memberSince: "Jan 2023",
        lastLogin: "Today, 09:41 AM",
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 transition-all">
                {/* Profile Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl shadow-xl p-6 mb-6"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-fuchsia-500/20 ring-4 ring-white">
                            {profile.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-extrabold tracking-tight mb-1">{profile.name}</h1>
                                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {profile.role}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 font-medium">
                                <Shield className="w-4 h-4 text-violet-500" />
                                Administrative Account
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-medium">{profile.status}</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">Admin since {profile.memberSince}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Last Login: {profile.lastLogin}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Activity className="w-4 h-4 text-gray-400" /> System Status: Optimal
                        </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Managed Users</div>
                                <div className="text-xl font-bold">12.4k</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending Reports</div>
                                <div className="text-xl font-bold">14</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Admin Activity */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-red-600" />
                        Recent Activity Log
                    </h2>
                    <div className="space-y-4">
                        {RECENT_ACTIVITY.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-gray-900">{activity.action}</span>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded inline-block border border-gray-200">
                                        {activity.target}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
