import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, Search, Loader2, DollarSign, Wallet, Star } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "react-toastify";
import { getEventStatus } from "../../utils/eventUtils";

// Define the Event type specifically for Admin panel handling
interface AdminEvent {
    _id: string;
    title: string;
    organizerId: {
        _id: string;
        name: string;
        email: string;
    };
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    location: string;
    volunteersNeeded: number;
    status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
    createdAt: string;
    photoUrl?: string; // Add photoUrl reference
    description: string;
    skills: string[];
    isPaid: boolean;
    paymentAmount: number;
    applicants: number;
    accepted: number;
}

export function AdminEvents() {
    const [filterStatus, setFilterStatus] = useState("pending");
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedEvent(null);
            }
        };

        if (selectedEvent) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedEvent]);

    const fetchEvents = async () => {
        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/events`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setEvents(data);
            } else if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem('crewup_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/admin/login';
            } else {
                toast.error(data.message || "Failed to fetch events");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistically update UI
        const previousEvents = [...events];
        const updatedEvents = events.map(ev =>
            ev._id === id ? { ...ev, status: newStatus as any } : ev
        );
        setEvents(updatedEvents);

        // Update selected event if it's currently open
        if (selectedEvent && selectedEvent._id === id) {
            setSelectedEvent({ ...selectedEvent, status: newStatus as any });
        }

        try {
            const token = sessionStorage.getItem('crewup_token');
            const res = await fetch(`http://${window.location.hostname}:3000/api/admin/events/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem('crewup_token');
                    toast.error('Session expired. Please log in again.');
                    window.location.href = '/admin/login';
                    return;
                }
                throw new Error(data.message);
            }
            toast.success(`Event ${newStatus === 'upcoming' ? 'Approved' : newStatus === 'cancelled' ? 'Rejected' : 'Reset to Pending'}`);
        } catch (error) {
            // Revert optimism on failure
            setEvents(previousEvents);
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        }
    };

    const filteredEvents = events.filter(e => {
        const isActuallyCompleted = getEventStatus(e.toDate) === "completed" || e.status === "completed";

        if (filterStatus === "completed") return isActuallyCompleted && e.status !== "cancelled";
        if (filterStatus === "upcoming") return e.status === "upcoming" && !isActuallyCompleted;
        if (filterStatus === "pending") return e.status === "pending" && !isActuallyCompleted;
        if (filterStatus === "cancelled") return e.status === "cancelled";
        return false;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Review Events</h1>
                        <p className="text-muted-foreground text-xs md:text-base">Approve new event requests or manage existing ones.</p>
                    </div>
                    {/* Mobile-optimized Filter Tabs */}
                    <div className="flex bg-gray-100 p-1 md:p-1.5 rounded-lg w-full md:w-max overflow-x-auto hide-scrollbar self-start">
                        {["pending", "upcoming", "cancelled", "completed"].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-1 md:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-md transition-all capitalize whitespace-nowrap text-[11px] md:text-sm font-semibold
                                    ${filterStatus === status
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {status === "upcoming" ? "Approved" : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading events...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 capitalize">No {filterStatus === "upcoming" ? "Approved" : filterStatus} Events</h3>
                            <p className="text-gray-500">There are currently no events in this category.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredEvents.map((event, i) => (
                                <motion.div
                                    layout
                                    key={event._id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 md:gap-6 relative"
                                >
                                    {/* Image - Hidden on mobile to save vertical space */}
                                    <div className="hidden md:flex w-64 h-40 shrink-0 rounded-2xl overflow-hidden relative bg-gray-100 items-center justify-center">
                                        <ImageWithFallback
                                            src={event.photoUrl ? `http://${window.location.hostname}:3000${event.photoUrl}` : ''}
                                            alt={event.title}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-1.5 md:mb-2 gap-1.5 md:gap-2">
                                            <div>
                                                <h3 className="text-base md:text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                                                    {event.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 md:mt-1.5">
                                                    <p className="text-[10px] md:text-sm font-medium text-violet-600 bg-violet-50 w-fit px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider md:normal-case md:tracking-normal">{event.organizerId?.name || "Unknown Organizer"}</p>
                                                    {/* Mobile Inline View Details Link */}
                                                    <button
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="md:hidden text-xs font-bold text-violet-600 flex items-center gap-0.5"
                                                    >
                                                        Details &rarr;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inline Meta Info on Mobile */}
                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1 md:mt-2 text-[11px] md:text-sm text-gray-600">
                                            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400 shrink-0" />
                                                <span>{event.fromDate} to {event.toDate}</span>
                                            </div>
                                            <span className="hidden md:inline text-gray-300">•</span>
                                            <span className="md:hidden text-gray-300">|</span>

                                            <div className="flex items-center gap-1 md:gap-2 truncate max-w-[120px] md:max-w-none">
                                                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                            <span className="hidden md:inline text-gray-300">•</span>
                                            <span className="md:hidden text-gray-300">|</span>

                                            <div className="flex items-center gap-1 md:gap-2">
                                                <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                <span>{event.volunteersNeeded} Volunteer</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col justify-end gap-1.5 md:gap-2 md:border-l border-gray-100 md:pl-6 pt-2.5 md:pt-0 border-t md:border-t-0 mt-2.5 md:mt-0">
                                        {/* Desktop-only prominent View Details button */}
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="hidden md:flex w-full md:w-auto items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl font-bold transition-colors md:mb-auto text-sm"
                                        >
                                            View Details →
                                        </button>

                                        {event.status === 'pending' && getEventStatus(event.toDate) !== "completed" && (
                                            <div className="flex gap-1.5 md:gap-2 w-full mt-0 md:mt-2">
                                                <button onClick={() => handleStatusUpdate(event._id, 'upcoming')} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 md:px-6 py-1 md:py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-md md:rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-[10px] md:text-sm">
                                                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> Approve
                                                </button>
                                                <button onClick={() => handleStatusUpdate(event._id, 'cancelled')} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 md:px-6 py-1 md:py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-md md:rounded-xl font-bold transition-all text-[10px] md:text-sm">
                                                    <XCircle className="w-3 h-3 md:w-4 md:h-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {event.status !== 'pending' && (getEventStatus(event.toDate) !== "completed" && event.status !== "completed") && (
                                            <button onClick={() => handleStatusUpdate(event._id, 'pending')} className="w-full flex items-center justify-center gap-1.5 md:gap-2 px-2 py-1 md:py-2 mt-0 md:mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md md:rounded-xl font-medium transition-colors text-[10px] md:text-sm">
                                                <Clock className="w-3 h-3 md:w-4 md:h-4" /> Reset
                                            </button>
                                        )}
                                        {(getEventStatus(event.toDate) === "completed" || event.status === "completed") && (
                                            <div className="flex items-center justify-center mt-0 md:mt-2">
                                                <span className="px-2 py-1 md:py-1.5 bg-gray-100 text-gray-500 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider text-center w-full">
                                                    Archived
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Event Details Modal */}
                <AnimatePresence>
                    {selectedEvent && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedEvent(null)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] md:-translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl bg-white rounded-2xl md:rounded-[2rem] shadow-2xl z-50 max-h-[70vh] md:max-h-[85vh] overflow-hidden flex flex-col"
                            >
                                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5">{selectedEvent.title}</h2>
                                            <p className="text-violet-600 text-xs md:text-sm font-semibold bg-violet-50 w-fit px-2.5 py-1 rounded-md">{selectedEvent.organizerId?.name || "Unknown Organizer"}</p>
                                        </div>
                                        <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Cover Image */}
                                    {selectedEvent.photoUrl && (
                                        <div className="w-full h-32 md:h-48 rounded-xl overflow-hidden mb-5 md:mb-6 shadow-sm">
                                            <ImageWithFallback
                                                src={`http://${window.location.hostname}:3000${selectedEvent.photoUrl}`}
                                                alt={selectedEvent.title}
                                                className="w-full h-full object-cover object-center"
                                            />
                                        </div>
                                    )}

                                    {/* Quick Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-5 md:mb-6">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5 font-medium"><Calendar className="w-3.5 h-3.5" /> Date</div>
                                            <div className="font-bold text-gray-900 text-[10px] md:text-sm truncate" title={`${selectedEvent.fromDate} to ${selectedEvent.toDate}`}>{selectedEvent.fromDate} to <br className="hidden md:block"/> {selectedEvent.toDate}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5" /> Location</div>
                                            <div className="font-bold text-gray-900 text-sm truncate" title={selectedEvent.location}>{selectedEvent.location}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5 font-medium"><Wallet className="w-3.5 h-3.5" /> Compensation</div>
                                            <div className="font-bold text-emerald-600 text-sm">
                                                {selectedEvent.isPaid ? `₹${selectedEvent.paymentAmount}` : "Volunteer (Unpaid)"}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5 font-medium"><Users className="w-3.5 h-3.5" /> Volunteers</div>
                                            <div className="font-bold text-violet-600 text-sm">{selectedEvent.accepted} / {selectedEvent.volunteersNeeded}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{selectedEvent.applicants} Total Applicants</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-5 md:mb-6">
                                        <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4 text-violet-500" /> Description
                                        </h3>
                                        <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50/50 border border-gray-100 p-4 md:p-5 rounded-xl">
                                            {selectedEvent.description}
                                        </div>
                                    </div>

                                    {/* Skills Needed */}
                                    {selectedEvent.skills && selectedEvent.skills.length > 0 && (
                                        <div className="mb-2">
                                            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                                <Star className="w-4 h-4 text-amber-500" /> Required Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                {selectedEvent.skills.map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Modal Actions (Sticky Footer) */}
                                <div className="p-3 md:p-4 border-t border-gray-100 bg-gray-50/80 flex justify-center md:justify-end gap-2 shrink-0 w-full">
                                    {selectedEvent.status === 'pending' && getEventStatus(selectedEvent.toDate) !== "completed" && (
                                        <div className="flex w-full md:w-auto gap-2">
                                            <button onClick={() => { handleStatusUpdate(selectedEvent._id, 'cancelled'); setSelectedEvent(null); }} className="flex-1 md:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-1.5 w-1/2 md:w-auto">
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                            <button onClick={() => { handleStatusUpdate(selectedEvent._id, 'upcoming'); setSelectedEvent(null); }} className="flex-1 md:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-bold transition-all shadow-sm hover:shadow-md text-xs flex items-center justify-center gap-1.5 w-1/2 md:w-auto">
                                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                                            </button>
                                        </div>
                                    )}
                                    {selectedEvent.status !== 'pending' && (getEventStatus(selectedEvent.toDate) !== "completed" && selectedEvent.status !== "completed") && (
                                        <button onClick={() => { handleStatusUpdate(selectedEvent._id, 'pending'); setSelectedEvent(null); }} className="px-4 py-1.5 md:py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-bold transition-all shadow-sm text-xs flex items-center justify-center gap-1.5 w-full md:w-auto">
                                            <Clock className="w-3.5 h-3.5" /> Reset
                                        </button>
                                    )}
                                    {(getEventStatus(selectedEvent.toDate) === "completed" || selectedEvent.status === "completed") && (
                                        <div className="px-4 py-1.5 md:py-2 bg-gray-200 text-gray-500 rounded-lg font-bold shadow-inner border border-gray-300 text-xs text-center flex items-center justify-center w-full md:w-auto">
                                            Archived
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
