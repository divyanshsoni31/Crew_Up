import React from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Download, TrendingUp, Users, Calendar } from "lucide-react";

const userGrowthData = [
    { month: 'Jan', volunteers: 4000, organizers: 2400 },
    { month: 'Feb', volunteers: 3000, organizers: 1398 },
    { month: 'Mar', volunteers: 2000, organizers: 9800 },
    { month: 'Apr', volunteers: 2780, organizers: 3908 },
    { month: 'May', volunteers: 1890, organizers: 4800 },
    { month: 'Jun', volunteers: 2390, organizers: 3800 },
    { month: 'Jul', volunteers: 3490, organizers: 4300 },
];

const eventTrendsData = [
    { category: 'Environment', events: 120 },
    { category: 'Health', events: 86 },
    { category: 'Education', events: 150 },
    { category: 'Community', events: 210 },
    { category: 'Disaster', events: 45 },
]

export function AdminReports() {

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Platform Metrics</h1>
                        <p className="text-muted-foreground">Analyze user growth, event engagement, and overall platform health.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Total Impact Hours</p>
                            <h3 className="text-3xl font-bold text-gray-900">45,210</h3>
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3.5 h-3.5" /> +12% this month
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Avg Volunteers / Event</p>
                            <h3 className="text-3xl font-bold text-gray-900">24.5</h3>
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3.5 h-3.5" /> +5% this month
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">Events Success Rate</p>
                            <h3 className="text-3xl font-bold text-gray-900">92%</h3>
                            <span className="text-red-500 text-sm font-medium flex items-center gap-1 mt-2">
                                <TrendingUp className="w-3.5 h-3.5 transform rotate-180" /> -1% this month
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Area Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                        <div>
                            <h3 className="text-lg font-bold mb-1">User Growth</h3>
                            <p className="text-sm text-muted-foreground mb-6">New user registrations over the last 7 months</p>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={userGrowthData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOrganizers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="volunteers" name="Volunteers" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolunteers)" />
                                    <Area type="monotone" dataKey="organizers" name="Organizers" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrganizers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                        <div>
                            <h3 className="text-lg font-bold mb-1">Events by Category</h3>
                            <p className="text-sm text-muted-foreground mb-6">Distribution of events organized this year</p>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={eventTrendsData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="events" name="Total Events" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
