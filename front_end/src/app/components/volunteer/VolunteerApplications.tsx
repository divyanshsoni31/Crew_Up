import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Clock, XCircle, Archive, MapPin, Calendar, QrCode } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import QRCode from "react-qr-code";

import { getEventStatus } from "../../utils/eventUtils";

export function VolunteerApplications() {
    const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "rejected" | "past">("pending");
    const [applicationsList, setApplicationsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // QR Modal State
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedEventQR, setSelectedEventQR] = useState<any>(null);

    const handleShowQR = (event: any) => {
        setSelectedEventQR(event);
        setShowQRModal(true);
    };

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = sessionStorage.getItem("crewup_token");
                const response = await fetch(`http://${window.location.hostname}:3000/api/events/volunteer/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setApplicationsList(data);
                }
            } catch (error) {
                console.error("Failed to load applications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Filter Logic to segregate into respective buckets based on explicit event dates
    const classifiedApplications = {
        pending: applicationsList.filter((app) => app.status === "pending" && app.eventId?.status !== "completed" && app.eventId?.status !== "cancelled" && getEventStatus(app.eventId?.date) === "upcoming"),
        accepted: applicationsList.filter((app) => app.status === "accepted" && app.eventId?.status !== "completed" && app.eventId?.status !== "cancelled" && getEventStatus(app.eventId?.date) === "upcoming"),
        rejected: applicationsList.filter((app) => app.status === "rejected" || app.eventId?.status === "cancelled"),
        past: applicationsList.filter((app) => (getEventStatus(app.eventId?.date) === "completed" || app.eventId?.status === "completed") && app.status !== "rejected" && app.eventId?.status !== "cancelled")
    };

    const tabs = [
        { id: "pending", label: "Pending", icon: Clock },
        { id: "accepted", label: "Accepted", icon: CheckCircle },
        { id: "rejected", label: "Rejected", icon: XCircle },
        { id: "past", label: "Past Events", icon: Archive },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">

            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-8 pb-32 rounded-b-[2.5rem] shadow-lg shadow-fuchsia-500/20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Applications</h1>
                    <p className="text-violet-100 font-medium mb-2">Track your application status and event history.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">

                {/* Horizontal Scroll Tabs */}
                <div className="flex gap-2 mb-16 overflow-x-auto pb-2 scrollbar-none justify-center">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap shrink-0 ${isActive
                                    ? "bg-white text-fuchsia-600 shadow-lg shadow-fuchsia-500/20 border-2 border-fuchsia-500"
                                    : "bg-white text-gray-500 hover:bg-gray-50 border-2 border-transparent"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-fuchsia-600" : ""}`} />
                                {tab.label}
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-fuchsia-100 text-fuchsia-700" : "bg-gray-100 text-gray-500"}`}>
                                    {classifiedApplications[tab.id as keyof typeof classifiedApplications].length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading applications...</p>
                            </div>
                        ) : classifiedApplications[activeTab].length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                                <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="font-extrabold text-gray-900 text-lg mb-1">No Applications Found</h3>
                                <p className="text-gray-500 text-sm">You dont have any {activeTab} events right now.</p>
                            </div>
                        ) : (
                            classifiedApplications[activeTab].map((app: any, idx) => {
                                const event = app.eventId; // We populated this object on the backend

                                return (
                                    <div key={app._id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 mb-4 sm:mb-0">
                                                {event?.photoUrl ? (
                                                    <img
                                                        src={`http://${window.location.hostname}:3000${event.photoUrl}`}
                                                        alt={event?.title || "Event"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageWithFallback src="" alt={event?.title || "Event"} className="w-full h-full object-cover" />
                                                )}
                                            </div>

                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{event?.title || "Unknown Event"}</h3>

                                                    {/* Status Badges */}
                                                    {activeTab === "pending" && (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0">In Review</span>
                                                    )}
                                                    {activeTab === "accepted" && (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0">Accepted</span>
                                                    )}
                                                    {activeTab === "rejected" && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0">Declined</span>
                                                    )}
                                                    {activeTab === "past" && (
                                                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0">Completed</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium mb-4">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event?.date || "TBD"}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event?.location || "TBD"}</span>
                                                </div>

                                                {/* Contextual Action Areas below details */}
                                                {activeTab === "pending" && (
                                                    <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between items-center text-gray-600">
                                                        <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                                                        <button className="text-fuchsia-600 font-bold hover:underline">Withdraw</button>
                                                    </div>
                                                )}

                                                {activeTab === "rejected" && (
                                                    <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600 border border-red-100">
                                                        <strong>Note:</strong> We appreciate your interest, but the organizer selected another applicant for this specific event roll.
                                                    </div>
                                                )}

                                                {activeTab === "past" && (
                                                    <div className="flex gap-4">
                                                        <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2">
                                                            <Clock className="w-4 h-4" /> {event.hours} Hours Logged
                                                        </div>
                                                        <button className="bg-white border rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                                                            View Certificate
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Show QR button explicitly on the Right Side exclusively for Accepted events */}
                                            {activeTab === "accepted" && (
                                                <button
                                                    onClick={() => handleShowQR(event)}
                                                    className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all flex justify-center items-center gap-2 shrink-0"
                                                >
                                                    <QrCode className="w-5 h-5" /> View Ticket
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* QR Code Modal for Accepted Events (Reused from Dashboard) */}
            <AnimatePresence>
                {showQRModal && selectedEventQR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQRModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl z-10 w-full max-w-sm relative overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors z-20"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6 relative z-10">
                                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-green-200">
                                    Accepted Event
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">{selectedEventQR.title}</h2>
                                <p className="text-gray-500 font-medium text-sm">{selectedEventQR.date}</p>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-6 shadow-inner relative z-10">
                                <QRCode
                                    value={`crewup-qr:${selectedEventQR._id}:vol-77`}
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                    fgColor="#4C1D95"
                                />
                            </div>

                            <div className="text-center relative z-10">
                                <p className="text-sm font-bold text-gray-900 mb-1">Show this at the entrance</p>
                                <p className="text-xs text-gray-500">The organizer will scan it to mark your attendance.</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
