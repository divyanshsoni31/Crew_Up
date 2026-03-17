import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, MapPin, Calendar, Clock, Star, ChevronRight, TrendingUp, Users, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "react-toastify";

import { getEventStatus } from "../../utils/eventUtils";

// Define strict event types
interface Event {
    _id: string;
    title: string;
    organizerId: {
        _id: string;
        name: string;
        rating: number;
        eventsHosted: number;
    };
    photoUrl?: string;
    location: string;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    volunteersNeeded: number;
    accepted: number;
    skills: string[];
}

export function ExploreEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const fetchPublicUpcomingEvents = async () => {
            try {
                const token = sessionStorage.getItem("crewup_token");
                if (!token) return navigate("/login");

                const response = await fetch(`http://${window.location.hostname}:3000/api/events`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch discoverable events.");
                }

                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Explore Events fetch error:", error);
                toast.error("Could not load events.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicUpcomingEvents();
    }, [navigate]);

    const categories = ["all", "environment", "education", "health", "community", "arts"];

    // Basic frontend filtering mechanism matching search queries
    const filteredEvents = events.filter((event) => {
        if (getEventStatus(event.toDate) === "completed") return false;

        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());

        // Quick visual mock formatting: If skills array embraces the category, match it, otherwise assume everything is 'all'
        const normalizedSkills = event.skills?.map(s => s.toLowerCase()) || [];
        const matchesCategory = selectedCategory === "all" || normalizedSkills.some(skill => skill.includes(selectedCategory));

        return matchesSearch && matchesCategory;

    });

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header & Search */}
            <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-32 rounded-b-[2.5rem] shadow-lg shadow-fuchsia-500/20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Explore Events</h1>
                    <p className="text-violet-100 font-medium mb-6">Discover amazing opportunities around you</p>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events, organizations, or locations..."
                            className="block w-full pl-11 pr-4 py-4 md:py-5 border-none rounded-[2rem] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl transition-shadow bg-white/95 backdrop-blur-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
                {/* Categories */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full font-bold text-sm capitalize whitespace-nowrap shrink-0 transition-all ${selectedCategory === category
                                ? "bg-white text-violet-600 shadow-lg shadow-violet-500/20 border-2 border-violet-500"
                                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Available Opportunities ({filteredEvents.length})</h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium tracking-wide">Scanning opportunities...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search criteria or checking back later for more events.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {filteredEvents.map((event, index) => {
                            // Render Match percentage mathematically based on slot availability for aesthetic value
                            const remainingSlots = event.volunteersNeeded - event.accepted;
                            const mathMatch = Math.min(100, Math.floor(60 + (remainingSlots * 4) + (event.organizerId.rating * 5)));

                            return (
                                <motion.div
                                    key={event._id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Link
                                        to={`/event/${event._id}`}
                                        className="block bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-gray-100 h-full flex flex-col"
                                    >
                                        <div className="relative h-48 bg-gray-100 shrink-0">
                                            {event.photoUrl ? (
                                                <img
                                                    src={`http://${window.location.hostname}:3000${event.photoUrl}`}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageWithFallback
                                                    src=""
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-violet-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-violet-100">
                                                <TrendingUp className="w-4 h-4" />
                                                {mathMatch}% Match
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-xl font-extrabold mb-1 text-gray-900 leading-tight">{event.title}</h3>
                                            <p className="text-sm font-medium text-fuchsia-600 hover:underline mb-4">By {event.organizerId?.name}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    <MapPin className="w-4 h-4 text-violet-400" />
                                                    {event.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                    <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                                                    {event.fromDate} to {event.toDate} <span className="text-gray-300 mx-1">|</span> {event.fromTime} - {event.toTime}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    <Users className="w-4 h-4 text-violet-400" />
                                                    {event.accepted} / {event.volunteersNeeded} volunteers
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                                        style={{ width: `${(event.accepted / event.volunteersNeeded) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                                {event.skills?.slice(0, 3).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {event.skills?.length > 3 && (
                                                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        +{event.skills.length - 3} more
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
