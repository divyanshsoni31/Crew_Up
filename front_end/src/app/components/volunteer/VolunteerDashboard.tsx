import { useState, useEffect } from "react";
import { Plus, Star, MapPin, Calendar, Users, TrendingUp, Award, Zap, ChevronRight, QrCode, X, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";

import { useAuth } from "../../contexts/AuthContext";
import { getEventStatus } from "../../utils/eventUtils";

const VOLUNTEER_STATS = {
  level: 2,
  xp: 300,
  xpToNext: 700,
  totalEvents: 10,
  totalHours: 20,
  rating: 4.5,
};

export function VolunteerDashboard() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEventQR, setSelectedEventQR] = useState<{ title: string, date: string, id: number } | null>(null);

  const [userName, setUserName] = useState("Volunteer");

  // Real Backend State
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("crewup_token");
        if (!token) {
          navigate("/login");
          return;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.name) setUserName(payload.name);
        } catch (e) {
          // Defaults to 'Volunteer'
        }

        const [appsRes, eventsRes] = await Promise.all([
          fetch(`http://${window.location.hostname}:3000/api/events/volunteer/applications`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://${window.location.hostname}:3000/api/events`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData);
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          // Filter out past events
          const upcomingDiscoverableEvents = eventsData.filter((e: any) => getEventStatus(e.toDate) === "upcoming" && e.status !== "completed" && e.status !== "cancelled");

          // Sort remaining upcoming events by Urgent Need logic
          const sortedMatches = upcomingDiscoverableEvents.sort((a: any, b: any) => {
            const priorityA = (a.volunteersNeeded - a.accepted) * (a.organizerId?.rating || 3);
            const priorityB = (b.volunteersNeeded - b.accepted) * (b.organizerId?.rating || 3);
            return priorityB - priorityA;
          }).slice(0, 3);

          setRecommendedEvents(sortedMatches);
        }
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Derived metrics
  // Derived metrics optimization (O(3N) -> O(1N) single pass)
  const { activeApplications, upcomingShift, completedEvents } = applications.reduce(
    (acc, app) => {
      const eDateStatus = getEventStatus(app.eventId?.toDate);
      const isEventUpcoming = eDateStatus === "upcoming";
      const isEventPast = eDateStatus === "completed" || app.eventId?.status === "completed";
      const isEventCanceled = app.eventId?.status === "cancelled";

      // 1. Check Active Applications
      if ((app.status === "pending" || app.status === "accepted") && !isEventPast && !isEventCanceled && isEventUpcoming) {
        acc.activeApplications.push(app);
      }

      // 2. Check Upcoming Shift (Take the first one we find)
      if (!acc.upcomingShift && app.status === "accepted" && !isEventPast && !isEventCanceled && isEventUpcoming) {
        acc.upcomingShift = app.eventId;
      }

      // 3. Count Completed Events
      if (isEventPast && app.status !== "rejected" && !isEventCanceled) {
        acc.completedEvents++;
      }

      return acc;
    },
    { activeApplications: [] as any[], upcomingShift: null as any, completedEvents: 0 }
  );

  const xpPercentage = (VOLUNTEER_STATS.xp / VOLUNTEER_STATS.xpToNext) * 100;

  const handleShowQR = (e: React.MouseEvent, event: any) => {
    e.preventDefault(); // Prevent navigating to event details
    setSelectedEventQR(event);
    setShowQRModal(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">


      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-24 shadow-lg shadow-fuchsia-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">Hey, {userName}! 👋</h1>
              <p className="text-violet-100 font-medium tracking-wide">Ready to make a difference today?</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        {/* Stats Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[1.5rem] flex items-center justify-center shadow-md shadow-teal-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">Level {VOLUNTEER_STATS.level}</span>
                  <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Rising Star
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {VOLUNTEER_STATS.xpToNext - VOLUNTEER_STATS.xp} XP to Level {VOLUNTEER_STATS.level + 1}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-xl font-bold">{VOLUNTEER_STATS.rating}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-md"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center bg-gray-50/50 p-3 rounded-[1.5rem]">
              <div className="text-2xl font-bold text-gray-900">{completedEvents}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Completed</div>
            </div>
            <div className="text-center bg-gray-50/50 p-3 rounded-[1.5rem]">
              <div className="text-2xl font-bold text-gray-900">{activeApplications.length}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active</div>
            </div>
            <div className="text-center bg-gray-50/50 p-3 rounded-[1.5rem]">
              <div className="text-2xl font-bold text-gray-900">{VOLUNTEER_STATS.xp}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total XP</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "recommended", "nearby", "urgent"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-2.5 rounded-full capitalize whitespace-nowrap transition-all font-bold text-sm ${selectedFilter === filter
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "bg-white text-muted-foreground hover:bg-violet-50 hover:text-violet-600 border border-gray-100"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-500" /> My Next Shift
          </h2>
          <Link to="/volunteer/applications" className="text-fuchsia-600 text-sm font-bold flex items-center gap-1 hover:underline">
            Browse All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* My Events Component */}
        <div className="space-y-4 mb-10">
          {upcomingShift ? (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-l-4 border-l-violet-500 border-y border-r border-gray-100 mb-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-violet-100 w-32 h-32 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>

              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-100 mb-4 md:mb-0">
                  {upcomingShift.photoUrl ? (
                    <img src={`http://${window.location.hostname}:3000${upcomingShift.photoUrl}`} alt={upcomingShift.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : (
                    <ImageWithFallback src="" alt={upcomingShift.title} className="w-full h-full object-cover opacity-90" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-extrabold text-gray-900">{upcomingShift.title}</h3>
                    <span className="bg-violet-100 text-violet-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Confirmed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      {upcomingShift.fromDate} to {upcomingShift.toDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-400" />
                      {upcomingShift.fromTime} - {upcomingShift.toTime}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-violet-400" />
                      {upcomingShift.location}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <Link
                      to={`/event/${upcomingShift._id}`}
                      className="inline-flex items-center gap-2 text-violet-600 font-bold hover:text-violet-700 transition-colors"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>

                    {/* View QR Code Button */}
                    <button
                      onClick={(e) => handleShowQR(e, upcomingShift)}
                      className="bg-violet-100 text-violet-700 px-4 py-2 rounded-xl font-bold hover:shadow-md hover:bg-violet-200 transition-all flex justify-center items-center shrink-0"
                      title="View QR Ticket"
                    >
                      <QrCode className="w-5 h-5 mr-2" /> QR Check-In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-8 text-center mb-10 w-full">
              <p className="text-gray-500 font-medium mb-4 w-full">You have no upcoming shifts lined up.</p>
              <Link to="/volunteer/events" className="px-6 py-2 bg-violet-100 text-violet-700 font-bold rounded-full text-sm inline-block">Find an Event</Link>
            </div>
          )}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recommended for You</h2>
          <Link to="/volunteer/events" className="text-fuchsia-600 text-sm font-bold flex items-center gap-1 hover:underline">
            Browse All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Event Cards */}
        <div className="space-y-4 mb-6">
          {recommendedEvents.length > 0 ? recommendedEvents.map((event, index) => {
            const remainingSlots = event.volunteersNeeded - event.accepted;
            const mathMatch = Math.min(100, Math.floor(75 + (remainingSlots * 2)));

            return (
              <motion.div
                key={event._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/event/${event._id}`}
                  className="block bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-gray-100"
                >
                  <div className="relative h-48 bg-gray-100">
                    {event.photoUrl ? (
                      <img src={`http://${window.location.hostname}:3000${event.photoUrl}`} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageWithFallback src="" alt={event.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-fuchsia-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-fuchsia-100">
                      <TrendingUp className="w-4 h-4" />
                      {mathMatch}% Match
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                    <p className="text-sm text-fuchsia-600 mb-4">{event.organizerId?.name || "Independent Organizer"}</p>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        <span className="truncate max-w-[150px]">{event.fromDate} to {event.toDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Users className="w-4 h-4 text-violet-400" />
                        {event.accepted} / {event.volunteersNeeded} slots filled
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        {event.fromTime} - {event.toTime}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {event.skills?.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center py-3.5 rounded-full font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all cursor-pointer">
                        View Event Details
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          }) : (
            <div className="text-center py-10">
              <p className="text-gray-500 italic">No recommendations available currently.</p>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-[2rem] shadow-sm p-6 mb-4 border border-gray-100">
          <h3 className="text-xl font-extrabold mb-5 flex items-center gap-2 text-gray-900 tracking-tight">
            <Award className="w-6 h-6 text-emerald-500" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[1.5rem] border border-teal-100/50">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Event Master</div>
                <div className="text-sm text-gray-600 font-medium">Completed 20+ events</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-[1.5rem] border border-violet-100/50">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
                ⭐
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">5-Star Volunteer</div>
                <div className="text-sm text-gray-600 font-medium">Received perfect rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Accepted Events */}
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
              {/* Background accents */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 relative z-10">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-green-200">
                  Accepted Event
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">{selectedEventQR.title}</h2>
                <p className="text-gray-500 font-medium text-sm">{selectedEventQR.date}</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-6 shadow-inner relative z-10">
                {/* 
                         * MOCK TOKEN FORMAT
                         * This token embeds the exact structure the Organizer QR Scanner expects:
                         * crewup-qr:[eventId]:[volunteerId]
                         */}
                <QRCode
                  value={`crewup-qr:${selectedEventQR.id}:vol-77`}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                  fgColor="#4C1D95" // Violet 900
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