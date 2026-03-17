import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, Eye, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";
import { getEventStatus } from "../../utils/eventUtils";

export function OrganizerEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/events/organizer`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      } else {
        toast.error(data.message || "Failed to fetch events");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize the 4 filter arrays into a single O(N) reduce operation
  const { pendingEvents, upcomingEvents, completedEvents, rejectedEvents } = events.reduce(
    (acc, e) => {
      const eStatus = getEventStatus(e.toDate);
      if (e.status === "pending") acc.pendingEvents.push(e);
      else if (e.status === "upcoming" && eStatus === "upcoming") acc.upcomingEvents.push(e);
      else if (e.status === "completed" || (e.status === "upcoming" && eStatus === "completed")) acc.completedEvents.push(e);
      else if (e.status === "cancelled") acc.rejectedEvents.push(e);
      return acc;
    },
    { pendingEvents: [] as any[], upcomingEvents: [] as any[], completedEvents: [] as any[], rejectedEvents: [] as any[] }
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">


      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Events</h1>
          <p className="text-violet-100 font-medium">Manage all your posted events</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Create Event Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate("/organizer/create-event")}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-full font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </motion.button>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "active" ? "text-violet-600" : "text-gray-500 hover:text-gray-800"
              }`}
          >
            Active Events
            {activeTab === "active" && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "completed" ? "text-violet-600" : "text-gray-500 hover:text-gray-800"
              }`}
          >
            Completed & Past
            {activeTab === "completed" && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center border border-gray-100"
          >
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">{pendingEvents.length}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Pending</div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center border border-gray-100"
          >
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{upcomingEvents.length}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Upcoming</div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center border border-gray-100"
          >
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">
              {events.reduce((sum, e) => sum + (e.applicants || 0), 0)}
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Total Applicants</div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center border border-gray-100"
          >
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{completedEvents.length}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Completed</div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center border border-gray-100"
          >
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">{rejectedEvents.length}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Rejected</div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Events Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Create your first event to start recruiting volunteers and building your crew!</p>
          </div>
        ) : (
          <>
            {activeTab === "active" && (
              <>
                {/* Pending Events */}
                {pendingEvents.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      Pending Approval
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Awaiting Admin</span>
                    </h2>
                    <div className="space-y-4">
                      {pendingEvents.map((event: any, index: number) => (
                        <motion.div
                          key={event._id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => navigate(`/organizer/event/${event._id}`)}
                          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer opacity-80 border-l-4 border-amber-400"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              {event.photoUrl && (
                                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100">
                                  <img
                                    src={`http://${window.location.hostname}:3000${event.photoUrl}`}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover object-center"
                                  />
                                </div>
                              )}
                              <h3 className="font-bold text-lg mb-2 text-gray-700">{event.title}</h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">{event.fromDate} to {event.toDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                  <div className="space-y-4">
                    {upcomingEvents.map((event: any, index: number) => (
                      <motion.div
                        key={event._id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => navigate(`/organizer/event/${event._id}`)}
                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {/* Add Photo Thumbnail if exists */}
                            {event.photoUrl && (
                              <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100">
                                <img
                                  src={`http://${window.location.hostname}:3000${event.photoUrl}`}
                                  alt="Event Banner"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="truncate max-w-[150px]">{event.fromDate} to {event.toDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <Eye className="w-5 h-5 text-primary" />
                          </button>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {event.skills?.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[11px] font-bold tracking-wide uppercase"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              <Users className="w-4 h-4 inline mr-1" />
                              Volunteers
                            </span>
                            <span className="font-medium">
                              {event.accepted}/{event.volunteersNeeded}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                              style={{ width: `${(event.accepted / event.volunteersNeeded) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span>{event.applicants} applications pending review</span>
                            <span className="text-violet-600 font-bold">View Details →</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "completed" && (
              <>
                {/* Completed Events */}
                {completedEvents.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Completed Events</h2>
                    <div className="space-y-4">
                      {completedEvents.map((event: any, index: number) => (
                        <motion.div
                          key={event._id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => navigate(`/organizer/event/${event._id}`)}
                          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer opacity-75"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg">{event.title}</h3>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Completed
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">{event.fromDate} to {event.toDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.accepted} volunteers participated
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Rejected Events */}
                {rejectedEvents.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      Rejected Events
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Requires Action</span>
                    </h2>
                    <div className="space-y-4">
                      {rejectedEvents.map((event: any, index: number) => (
                        <motion.div
                          key={event._id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => navigate(`/organizer/event/${event._id}`)}
                          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-red-500"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-gray-800 line-through opacity-70">{event.title}</h3>
                                <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold uppercase tracking-wide">
                                  Rejected by Admin
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-red-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">{event.fromDate} to {event.toDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-red-500 mt-2">
                            Please review community guidelines or contact support to resolve this block.
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
