import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Loader2,
} from "lucide-react";
import { getEventStatus } from "../../utils/eventUtils";

export function OrganizerEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const token = sessionStorage.getItem('crewup_token');
      const headers = { "Authorization": `Bearer ${token}` };

      // Parallelize fetches for speed
      const [eventRes, appsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3000/api/events/${id}`, { headers }),
        fetch(`http://${window.location.hostname}:3000/api/events/${id}/applications`, { headers })
      ]);

      if (!eventRes.ok) throw new Error("Failed to fetch event details");
      if (!appsRes.ok) throw new Error("Failed to fetch applications");

      const eventData = await eventRes.json();
      const appsData = await appsRes.json();

      setEvent(eventData);
      setApplications(appsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error loading dashboard");
      navigate("/organizer/events");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApplications = applications.filter((app) => app.status === "pending");
  const acceptedApplications = applications.filter((app) => app.status === "accepted");
  const rejectedApplications = applications.filter((app) => app.status === "rejected");

  const isCompleted = event ? (getEventStatus(event.toDate) === "completed" || event.status === "completed" || event.status === "cancelled") : false;

  const updateApplicationStatus = async (appId: string, status: string) => {
    // Optimistic UI updates
    const previousApps = [...applications];
    setApplications(applications.map(app =>
      app._id === appId ? { ...app, status } : app
    ));

    // Optimistically modify the parent event progress bar state
    if (status === "accepted") {
      setEvent({ ...event, accepted: (event?.accepted || 0) + 1 });
    } else if (status === "rejected") {
      const prevStatus = previousApps.find(a => a._id === appId)?.status;
      if (prevStatus === "accepted") {
        setEvent({ ...event, accepted: Math.max((event?.accepted || 0) - 1, 0) });
      }
    }

    try {
      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/events/${id}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (err) {
      // Revert if API fails
      setApplications(previousApps);
      // Revert event accepted counts dynamically by re-fetching
      fetchEventDetails();
      toast.error(err instanceof Error ? err.message : "Failed to update application");
    }
  };

  const handleAccept = (appId: string) => updateApplicationStatus(appId, 'accepted');
  const handleReject = (appId: string) => updateApplicationStatus(appId, 'rejected');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">


      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-primary text-white px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/organizer/events")}
            className="flex items-center gap-2 mb-4 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
            {event.title}
            {isCompleted && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm border border-white/10">
                Completed
              </span>
            )}
          </h1>
          <div className="space-y-1 text-purple-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {event.fromDate} to {event.toDate} • {event.fromTime} - {event.toTime}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{acceptedApplications.length}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">
              {event.accepted || 0}/{event.volunteersNeeded}
            </div>
            <div className="text-xs text-muted-foreground">Filled</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Volunteer Progress</span>
            <span className="text-sm text-muted-foreground">
              {event.accepted || 0} of {event.volunteersNeeded} spots filled
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((event.accepted || 0) / event.volunteersNeeded) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-600 to-primary rounded-full"
            />
          </div>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              Pending Applications ({pendingApplications.length})
            </h2>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <motion.div
                  key={application._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative group cursor-help shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm text-white font-bold uppercase">
                        {application.volunteerId?.name?.charAt(0) || '?'}
                      </div>

                      {/* Hover Popup Profile */}
                      <div className="hidden md:block absolute left-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md uppercase">
                            {application.volunteerId?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-lg">{application.volunteerId?.name || 'Unknown'}</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              5.0 Volunteer Rating
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100/50">
                            <div className="text-2xl font-black text-purple-600 mb-0.5">32</div>
                            <div className="text-[10px] text-purple-500 uppercase font-black tracking-wider">Total Events</div>
                          </div>
                          <div className="bg-primary/5 rounded-2xl p-3 text-center border border-primary/10">
                            <div className="text-2xl font-black text-primary mb-0.5">156</div>
                            <div className="text-[10px] text-primary/70 uppercase font-black tracking-wider">Hours Tracked</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{application.volunteerId?.name || 'Unknown User'}</h3>
                        <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          Level 8
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          5.0
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          32 events
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {application.volunteerId?.skills?.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-bold uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {application.message && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-muted-foreground italic">
                        "{application.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    {!isCompleted ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(application._id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1 font-bold"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAccept(application._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1 font-bold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Archived
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Volunteers */}
        {acceptedApplications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              Accepted Volunteers ({acceptedApplications.length})
            </h2>
            <div className="space-y-3">
              {acceptedApplications.map((application) => (
                <div
                  key={application._id}
                  className="bg-green-50 border border-green-200 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative group cursor-help shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-xl shadow-sm text-white font-bold uppercase">
                        {application.volunteerId?.name?.charAt(0) || '?'}
                      </div>

                      {/* Hover Popup Profile */}
                      <div className="hidden md:block absolute left-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md uppercase">
                            {application.volunteerId?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-lg">{application.volunteerId?.name || 'Unknown User'}</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              5.0 Volunteer Rating
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100/50">
                            <div className="text-2xl font-black text-green-600 mb-0.5">32</div>
                            <div className="text-[10px] text-green-700 uppercase font-black tracking-wider">Total Events</div>
                          </div>
                          <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100/50">
                            <div className="text-2xl font-black text-emerald-600 mb-0.5">156</div>
                            <div className="text-[10px] text-emerald-700 uppercase font-black tracking-wider">Hours Tracked</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{application.volunteerId?.name || 'Unknown User'}</h3>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        5.0 • 32 events
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Applications */}
        {applications.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              Volunteers will see your event and apply soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
