import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Search, Calendar, User, Clock, Star, Award } from "lucide-react";
import { toast } from "react-toastify";

// Define the shape of our real Application document populated by MongoDB
interface Application {
    _id: string;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
    createdAt: string;
    eventId: {
        _id: string;
        title: string;
        date: string;
        photoUrl?: string; // Optional if you decide to use it
    };
    volunteerId: {
        _id: string;
        name: string;
        email: string;
    };
    volunteerDetails: {
        skills: string[];
        totalXP: number;
        level: number;
        totalEvents: number;
        profilePhoto?: string;
        city?: string;
    } | null;
}

export function OrganizerApplications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [filterStatus, setFilterStatus] = useState<"pending" | "accepted" | "rejected">("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = sessionStorage.getItem("crewup_token");
                const res = await fetch(`http://${window.location.hostname}:3000/api/events/organizer/applications`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch applications");
                }

                const data = await res.json();
                setApplications(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching applications:", error);
                toast.error("Failed to load volunteer applications");
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleStatusUpdate = async (appId: string, eventId: string, newStatus: string) => {
        try {
            const token = sessionStorage.getItem("crewup_token");
            const res = await fetch(`http://${window.location.hostname}:3000/api/events/${eventId}/applications/${appId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update status");
            }

            toast.success(`Application marked as ${newStatus}`);
            // Update UI State Synchronously
            setApplications(apps => apps.map(app => app._id === appId ? { ...app, status: newStatus as any } : app));
        } catch (error: any) {
            console.error("Status update error:", error);
            toast.error(error.message || "An error occurred");
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesStatus = app.status === filterStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            app.volunteerId.name.toLowerCase().includes(searchLower) ||
            app.eventId.title.toLowerCase().includes(searchLower) ||
            app.message?.toLowerCase().includes(searchLower) ||
            app.volunteerDetails?.skills?.some(skill => skill.toLowerCase().includes(searchLower));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-10 pb-20 shadow-lg shadow-fuchsia-500/20 rounded-b-[3rem] md:rounded-b-[4rem]">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Review Applications</h1>
                    <p className="text-violet-100 font-medium text-lg">Manage volunteer requests for your events</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">

                {/* Controls */}
                <div className="bg-white rounded-2xl p-4 shadow-md mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {(["pending", "accepted", "rejected"] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 flex-1 md:flex-none rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === status ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {status}
                                {status === 'pending' && (
                                    <span className="ml-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {applications.filter(a => a.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search name or event..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all bg-gray-50 hover:bg-white"
                        />
                    </div>
                </div>

                {/* Application List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-400 font-medium">Loading network applications...</div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredApps.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm"
                                >
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900 capitalize">No {filterStatus} Applications</h3>
                                    <p className="text-gray-500">You're all caught up here!</p>
                                </motion.div>
                            ) : (
                                filteredApps.map((app, index) => (
                                    <motion.div
                                        key={app._id}
                                        layout
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.95, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
                                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row gap-5">

                                            {/* Volunteer Info Strip */}
                                            <div className="relative group flex items-start gap-4 md:w-1/3 shrink-0 cursor-help">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm">
                                                    {app.volunteerDetails?.profilePhoto ? (
                                                        <img src={`http://${window.location.hostname}:3000${app.volunteerDetails.profilePhoto}`} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        app.volunteerId.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 mb-0.5 group-hover:text-violet-600 transition-colors">{app.volunteerId.name}</h3>
                                                    <div className="flex items-center gap-1 text-sm font-medium text-orange-600 mb-1">
                                                        <Award className="w-3.5 h-3.5" />
                                                        Level {app.volunteerDetails?.level || 1} Volunteer
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" /> applied {new Date(app.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {/* Hover Popup Profile */}
                                                <div className="hidden md:block absolute left-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:-translate-y-1">
                                                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                                                            {app.volunteerDetails?.profilePhoto ? (
                                                                <img src={`http://${window.location.hostname}:3000${app.volunteerDetails.profilePhoto}`} alt="Avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                app.volunteerId.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-gray-900 text-lg">{app.volunteerId.name}</div>
                                                            <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                                                                <Award className="w-4 h-4" />
                                                                Level {app.volunteerDetails?.level || 1} Volunteer
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-violet-50 rounded-2xl p-3 text-center border border-violet-100/50">
                                                            <div className="text-2xl font-black text-violet-600 mb-0.5">{app.volunteerDetails?.totalEvents || 0}</div>
                                                            <div className="text-[10px] text-violet-500 uppercase font-black tracking-wider">Total Events</div>
                                                        </div>
                                                        <div className="bg-fuchsia-50 rounded-2xl p-3 text-center border border-fuchsia-100/50">
                                                            <div className="text-2xl font-black text-fuchsia-600 mb-0.5">{app.volunteerDetails?.totalXP || 0}</div>
                                                            <div className="text-[10px] text-fuchsia-500 uppercase font-black tracking-wider">Total XP</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Application Details */}
                                            <div className="flex-1">
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Applied For</p>
                                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {app.eventId.title} <span className="text-gray-400 font-normal">({new Date(app.eventId.date).toLocaleDateString()})</span>
                                                    </div>
                                                </div>

                                                {app.message && (
                                                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 italic border border-gray-100 mb-3">
                                                        "{app.message}"
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-1.5">
                                                    {app.volunteerDetails?.skills && app.volunteerDetails.skills.length > 0 ? (
                                                        app.volunteerDetails.skills.map(skill => (
                                                            <span key={skill} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[11px] font-semibold tracking-wide">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No specific skills listed</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {app.status === 'pending' && (
                                                <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-32 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5 mt-2 md:mt-0">
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, app.eventId._id, 'accepted')}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, app.eventId._id, 'rejected')}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                            {app.status !== 'pending' && (
                                                <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-32 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5 mt-2 md:mt-0 justify-center">
                                                    <div className={`text-center py-2 rounded-xl text-sm font-bold capitalize ${app.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {app.status}
                                                    </div>
                                                    <button onClick={() => handleStatusUpdate(app._id, app.eventId._id, 'pending')} className="text-xs text-gray-500 hover:text-gray-900 underline text-center pb-2">
                                                        Undo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
