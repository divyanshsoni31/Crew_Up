import { ArrowLeft, Star, Award, Calendar, MapPin, Download, Share2, TrendingUp, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";

const MOCK_COMPLETED_EVENTS = [
  {
    id: 1,
    title: "City Marathon Support",
    organization: "RunForGood",
    date: "Feb 20, 2026",
    role: "First Aid Support",
    hours: 6,
    rating: 5.0,
  },
  {
    id: 2,
    title: "Community Food Drive",
    organization: "FeedOurCity",
    date: "Feb 5, 2026",
    role: "Coordination",
    hours: 4,
    rating: 4.8,
  },
  {
    id: 3,
    title: "Tech Conference",
    organization: "InnovateTech",
    date: "Jan 15, 2026",
    role: "Tech Support",
    hours: 8,
    rating: 5.0,
  },
];

const ACHIEVEMENTS = [
  { id: 1, name: "Event Master", icon: "🎉", description: "Completed 20+ events", earned: true },
  { id: 2, name: "5-Star Volunteer", icon: "⭐", description: "Perfect rating", earned: true },
  { id: 3, name: "Early Bird", icon: "🌅", description: "First to apply to 10 events", earned: true },
  { id: 4, name: "Community Hero", icon: "🦸", description: "100+ volunteer hours", earned: false },
  { id: 5, name: "Skill Master", icon: "🎯", description: "Master 5+ skills", earned: false },
  { id: 6, name: "Team Player", icon: "🤝", description: "Helped 50+ organizers", earned: false },
];

const CERTIFICATES = [
  { id: 1, name: "First Aid Certified", issuer: "Red Cross", date: "Dec 2025", icon: "🩹" },
  { id: 2, name: "Event Management", issuer: "CrewUp Academy", date: "Jan 2026", icon: "📋" },
  { id: 3, name: "Crowd Safety", issuer: "Safety First Org", date: "Nov 2025", icon: "👥" },
];

const VOLUNTEER_STATS = {
  level: 2,
  xp: 300,
  xpToNext: 700,
  totalEvents: 2,
  totalHours: 4,
  rating: 4.5,
};

export function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("crewup_token");
        const res = await fetch(`http://${window.location.hostname}:3000/api/volunteer/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Fallbacks for layout structure
  const currentXP = VOLUNTEER_STATS.xp;
  const currentLevel = VOLUNTEER_STATS.level;
  const nextLevelXP = VOLUNTEER_STATS.xpToNext;
  const xpPercentage = (currentXP / nextLevelXP) * 100;

  // Parse string array to objects for existing layout
  const mappedSkills = profile?.skills?.map((skillStr: string, index: number) => ({
    name: skillStr,
    level: Math.max(1, Math.min(10, currentLevel + index)), // Mock skill progression
    xp: currentXP > 0 ? currentXP * 0.2 : 0
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-28 shadow-lg shadow-fuchsia-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-sm hover:bg-white/30 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2rem] shadow-xl p-8 mb-6 border border-gray-100/50"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
            <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-fuchsia-500/20 border-4 border-white overflow-hidden text-white font-bold">
              {profile?.profilePhoto ? (
                <img src={`http://${window.location.hostname}:3000${profile.profilePhoto}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "👤"
              )}
            </div>
            <div className="flex-1 mt-2">
              <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{user?.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-3 font-medium">
                <MapPin className="w-4 h-4 text-violet-500" />
                {profile?.city || "Unknown Location"}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-yellow-700">{VOLUNTEER_STATS.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-gray-500 font-medium">Member since {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 rounded-[1.5rem] p-5 mb-8 border border-fuchsia-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-md shadow-fuchsia-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gray-900">Level {currentLevel}</div>
                  <div className="text-sm font-medium text-fuchsia-600">
                    {nextLevelXP - currentXP} XP to next level
                  </div>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                Rising Star
              </div>
            </div>
            <div className="h-3 bg-white/60 rounded-full overflow-hidden shadow-inner border border-fuchsia-100/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-5 bg-gray-50/80 rounded-[1.5rem] border border-gray-100">
              <div className="text-3xl font-extrabold text-violet-700">{VOLUNTEER_STATS.totalEvents}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Events</div>
            </div>
            <div className="text-center p-5 bg-gray-50/80 rounded-[1.5rem] border border-gray-100">
              <div className="text-3xl font-extrabold text-fuchsia-600">{VOLUNTEER_STATS.totalHours}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Hours</div>
            </div>
            <div className="text-center p-5 bg-gray-50/80 rounded-[1.5rem] border border-gray-100">
              <div className="text-3xl font-extrabold text-pink-500">{VOLUNTEER_STATS.xp}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Total XP</div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed font-medium">{profile?.bio || "No bio available."}</p>
          </div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[2rem] shadow-sm p-8 mb-6 border border-gray-100"
        >
          <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-gray-900 tracking-tight">
            <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center text-xl">
              🎯
            </div>
            Skills
          </h2>
          <div className="space-y-5">
            {mappedSkills.length > 0 ? mappedSkills.map((skill: any, index: number) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">{skill.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{skill.xp} XP</span>
                    <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Lv {skill.level}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.level / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 font-medium">No skills added yet.</p>
            )}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-[2rem] shadow-sm p-8 mb-6 border border-gray-100"
        >
          <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-gray-900 tracking-tight">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-5 rounded-[1.5rem] border-2 transition-all text-center flex flex-col items-center justify-center ${achievement.earned
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm"
                  : "border-gray-100 bg-gray-50/50 opacity-60 grayscale-[50%]"
                  }`}
              >
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <div className="font-bold text-gray-900 text-sm mb-1">{achievement.name}</div>
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{achievement.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Certificates Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-[2rem] shadow-sm p-8 mb-6 border border-gray-100"
        >
          <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-gray-900 tracking-tight">
            <div className="w-10 h-10 bg-fuchsia-50 rounded-full flex items-center justify-center text-xl">
              📜
            </div>
            Certificates
          </h2>
          <div className="space-y-4">
            {CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-fuchsia-200 hover:shadow-md transition-all rounded-[1.5rem]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                    {cert.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{cert.name}</div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                      {cert.issuer} • {cert.date}
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-colors shadow-sm border border-gray-100 group">
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-fuchsia-600 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Completed Events */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100"
        >
          <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-gray-900 tracking-tight">
            <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            Completed Events ({VOLUNTEER_STATS.totalEvents})
          </h2>
          <div className="space-y-4">
            {MOCK_COMPLETED_EVENTS.map((event) => (
              <div
                key={event.id}
                className="p-5 border border-gray-100 rounded-[1.5rem] hover:border-violet-200 hover:shadow-md transition-all bg-gray-50/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 font-medium">{event.organization}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100 text-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-yellow-700">{event.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>{event.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-violet-600">{event.role}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{event.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}