import { ArrowLeft, MapPin, Calendar, Users, Clock, Star, CheckCircle2, Share2, Heart, Award, ShieldAlert, Loader2 } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Specific Application Tracking State
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchDetailedEventData = async () => {
      try {
        const token = sessionStorage.getItem("crewup_token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Parallel fetches for Speed:
        // 1. Get Event Data
        // 2. Map existing applications to see if this volunteer already applied
        const [eventRes, applicationsRes] = await Promise.all([
          fetch(`http://${window.location.hostname}:3000/api/events/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://${window.location.hostname}:3000/api/events/volunteer/applications`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!eventRes.ok) throw new Error("Could not load event details.");

        const eventData = await eventRes.json();
        setEvent(eventData);

        if (applicationsRes.ok) {
          const applicationsList = await applicationsRes.json();
          // Find if any application explicitly maps onto the currently viewed eventId
          const existingApp = applicationsList.find((app: any) =>
            app.eventId._id === id || app.eventId === id
          );

          if (existingApp) {
            setApplicationStatus(existingApp.status);
          }
        }

      } catch (err: any) {
        console.error("View Event Error:", err);
        toast.error(err.message || "Failed to load event.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetailedEventData();
    }
  }, [id, navigate]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const token = sessionStorage.getItem("crewup_token");
      const response = await fetch(`http://${window.location.hostname}:3000/api/events/${id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "I'm highly motivated to help!" })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      // Immediate feedback
      toast.success("Application Submitted successfully!");
      setApplicationStatus("pending");

      setTimeout(() => {
        navigate("/volunteer/applications");
      }, 1500);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
        <p className="text-gray-500 font-bold tracking-widest uppercase">Fetching Complete Context...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-gray-500 mb-6">The event you are looking for may have been deleted or lacks public clearance.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-violet-600 text-white rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  // Derive math representation for "matching/likelihood" score as a UI aesthetic standard
  const remainingSlots = event.volunteersNeeded - event.accepted;
  const matchPercentage = Math.min(100, Math.floor(75 + (remainingSlots * 2)));

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header Image */}
      <div className="relative h-72 bg-gray-900">
        {event.photoUrl ? (
          <img
            src={`http://${window.location.hostname}:3000${event.photoUrl}`}
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <ImageWithFallback
            src=""
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
        )}

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Match Badge */}
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20 tracking-wide text-sm border border-fuchsia-400">
          <Star className="w-4 h-4 fill-white" />
          {matchPercentage}% Match
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100/50"
        >
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">{event.title}</h1>
          <Link to="#" className="text-fuchsia-600 font-bold hover:underline mb-6 inline-block">
            {event.organizerId?.name || "Independent Organizer"}
          </Link>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-violet-50 rounded-[1rem] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Location</div>
                <div className="font-semibold text-gray-900">{event.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-fuchsia-50 rounded-[1rem] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-fuchsia-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Duration</div>
                <div className="font-semibold text-gray-900">{event.fromDate} to {event.toDate}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-pink-50 rounded-[1rem] flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Time</div>
                <div className="font-semibold text-gray-900">{event.fromTime} - {event.toTime}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-[1rem] flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Volunteers Filled</div>
                <div className="font-semibold text-gray-900">{event.accepted} / {event.volunteersNeeded} slots</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">About This Event</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Required Skills */}
          {event.skills && event.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-3 text-gray-900">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {event.skills.map((skill: string) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 p-3 bg-violet-50 rounded-2xl border border-violet-100/50 pr-4"
                  >
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                    <span className="font-bold text-violet-900 text-sm tracking-wide">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {event.responsibilities && event.responsibilities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">Your Responsibilities</h3>
              <ul className="space-y-2">
                {event.responsibilities.map((resp: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks */}
          <div className="mb-8">
            <h3 className="font-bold mb-4 text-gray-900">What You'll Get</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[1rem] border border-teal-100">
                <span className="text-2xl bg-white p-2 rounded-full shadow-sm">✨</span>
                <div>
                  <span className="font-bold text-gray-900 block">Official CrewUp Certificate</span>
                  <span className="text-xs text-teal-700 font-bold uppercase mt-0.5 tracking-wide">Platform Verified</span>
                </div>
              </div>

              {event.isPaid && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-[1rem] border border-orange-100">
                  <span className="text-2xl bg-white p-2 rounded-full shadow-sm">💰</span>
                  <div>
                    <span className="font-bold text-gray-900 block">Paid Compensation</span>
                    <span className="text-xs text-orange-700 font-bold mt-0.5">₹{event.paymentAmount} Stipend</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full shadow-md flex items-center justify-center text-2xl font-bold text-white">
                {event.organizerId?.name?.charAt(0) || "O"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg mb-0.5">{event.organizerId?.name}</div>
                <div className="flex items-center gap-2 text-sm text-fuchsia-700 font-medium">
                  <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {event.organizerId?.rating || "5.0"}
                  </span>
                  <span>•</span>
                  <span>{event.organizerId?.eventsHosted || 0} events hosted</span>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 pb-20 z-50">
        <div className="max-w-4xl mx-auto flex items-center">
          {applicationStatus === "pending" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-amber-50 text-amber-700 py-4 rounded-full text-center font-bold flex items-center justify-center gap-2 shadow-sm border border-amber-200 text-lg"
            >
              <Clock className="w-5 h-5" />
              Application in Review
            </motion.div>
          ) : applicationStatus === "accepted" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-full text-center font-bold flex items-center justify-center gap-2 shadow-sm border border-emerald-200 text-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              You're In! See Dashboard
            </motion.div>
          ) : applicationStatus === "rejected" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-red-50 text-red-600 py-4 rounded-full text-center font-bold flex items-center justify-center gap-2 shadow-sm border border-red-200 text-lg"
            >
              Not Selected for this Event
            </motion.div>
          ) : event.accepted >= event.volunteersNeeded ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-gray-100 text-gray-500 py-4 rounded-full text-center font-bold shadow-sm border border-gray-200 text-lg"
            >
              Capacity Reached
            </motion.div>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className={`w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-full font-extrabold hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all text-lg tracking-wide ${isApplying ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isApplying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </span>
              ) : "Apply for This Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}