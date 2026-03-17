import { useState } from "react";
import {
  Camera,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

const SKILLS = [
  { id: "crowd", label: "Crowd Handling", icon: "👥" },
  { id: "photo", label: "Photography", icon: "📸" },
  { id: "firstaid", label: "First Aid", icon: "🩹" },
  { id: "tech", label: "Tech Support", icon: "💻" },
  { id: "marketing", label: "Marketing", icon: "📱" },
  { id: "coordination", label: "Coordination", icon: "🎯" },
];

export function VolunteerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    photo: null as string | null,
    skills: [] as string[],
    location: "",
    availability: "weekends",
  });

  const handleSkillToggle = (skillId: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleComplete = () => {
    navigate("/volunteer/dashboard");
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-fuchsia-50 pb-8">
      {/* Progress Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step} of 3
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                  Welcome to CrewUp!
                </h1>
                <p className="text-gray-500 font-medium">
                  Let's set up your volunteer profile
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 pt-10 space-y-6">
                <div>
                  <label className="block mb-2 text-sm">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full shadow-inner flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white">
                      {profile.name.charAt(0).toUpperCase() || (
                        <Camera className="w-10 h-10" />
                      )}
                    </div>
                    <button className="px-6 py-2 bg-secondary text-foreground rounded-full hover:bg-gray-200 transition-colors">
                      Upload Photo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    placeholder="your.email@example.com"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!profile.name || !profile.email}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-4 rounded-full font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                  <span className="text-4xl">🎯</span>
                </div>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                  Choose Your Skills
                </h1>
                <p className="text-gray-500 font-medium">
                  Select all that apply - you can add more later
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 pt-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {SKILLS.map((skill) => {
                    const isSelected = profile.skills.includes(
                      skill.id,
                    );
                    return (
                      <motion.button
                        key={skill.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleSkillToggle(skill.id)
                        }
                        className={`relative p-6 rounded-[1.5rem] border-2 transition-all ${
                          isSelected
                            ? "border-violet-500 bg-violet-50 shadow-md ring-2 ring-violet-500/20"
                            : "border-gray-200 hover:border-violet-500/50 hover:bg-gray-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-3xl mb-3">
                          {skill.icon}
                        </div>
                        <div className="font-semibold text-sm text-gray-800">
                          {skill.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-foreground py-4 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={profile.skills.length === 0}
                    className="flex-2 flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-4 rounded-full hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                  Where & When?
                </h1>
                <p className="text-gray-500 font-medium">
                  Help us match you with nearby events
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 pt-10 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          location: e.target.value,
                        })
                      }
                      placeholder="City or ZIP code"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Availability
                  </label>
                  <div className="space-y-3">
                    {["weekends", "weekdays", "flexible"].map(
                      (option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            profile.availability === option
                              ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/20"
                              : "border-gray-200 hover:border-violet-500/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value={option}
                            checked={
                              profile.availability === option
                            }
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                availability: e.target.value,
                              })
                            }
                            className="w-5 h-5 text-violet-600 focus:ring-violet-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium capitalize">
                              {option}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {option === "weekends" &&
                                "Saturdays & Sundays"}
                              {option === "weekdays" &&
                                "Monday - Friday"}
                              {option === "flexible" &&
                                "Anytime works for me"}
                            </div>
                          </div>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-foreground py-4 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={!profile.location}
                    className="flex-2 flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-4 rounded-full hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}