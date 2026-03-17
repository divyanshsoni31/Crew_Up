import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  CheckCircle,
  ImagePlus,
  X
} from "lucide-react";
import { toast } from "react-toastify";


const AVAILABLE_SKILLS = [
  "Crowd Handling",
  "Photography",
  "First Aid",
  "Tech Support",
  "Marketing",
  "Coordination",
];

export function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    fromDate: "",
    toDate: "",
    fromTime: "",
    toTime: "",
    location: "",
    volunteersNeeded: "",
    description: "",
    skills: [] as string[],
    isPaid: false,
    paymentAmount: "",
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
      // Generate a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCustomSkillAdd = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, customSkill.trim()] }));
      setCustomSkill("");
      setShowCustomSkill(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build a standard multipart/form-data container 
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("fromDate", formData.fromDate);
      payload.append("toDate", formData.toDate);
      payload.append("fromTime", formData.fromTime);
      payload.append("toTime", formData.toTime);
      payload.append("location", formData.location);
      payload.append("volunteersNeeded", formData.volunteersNeeded.toString());
      payload.append("description", formData.description);
      payload.append("isPaid", formData.isPaid.toString());
      payload.append("paymentAmount", formData.paymentAmount || "0");
      payload.append("skills", JSON.stringify(formData.skills));

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const token = sessionStorage.getItem('crewup_token');
      const res = await fetch(`http://${window.location.hostname}:3000/api/events`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // NOT setting Content-Type explicitly so the browser automatically handles boundary parsing for the file
        },
        body: payload
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/organizer/events");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to create event");
      }

    } catch (err) {
      console.error(err);
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2rem] p-8 text-center max-w-md shadow-xl shadow-green-500/10 border border-green-100"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Event Created!</h2>
          <p className="text-muted-foreground font-medium">
            Your event has been posted successfully. Volunteers will start applying soon!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">


      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-16 shadow-lg shadow-fuchsia-500/20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/organizer/dashboard")}
            className="flex items-center gap-2 mb-4 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-medium backdrop-blur-sm bg-white/10 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create New Event</h1>
          <p className="text-violet-100 font-medium">Fill in the details for your event</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6 -mt-8 relative z-10">
          {/* Event Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-2 font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Music Festival"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </motion.div>

          {/* Date and Time Duration */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 space-y-4"
          >
            {/* Dates row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  From Date
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  To Date
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  min={formData.fromDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Times row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  From Time
                </label>
                <input
                  type="time"
                  value={formData.fromTime}
                  onChange={(e) => setFormData({ ...formData, fromTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  To Time
                </label>
                <input
                  type="time"
                  value={formData.toTime}
                  onChange={(e) => setFormData({ ...formData, toTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-2 font-medium flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Central Park, New York, NY"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </motion.div>

          {/* Volunteers Needed */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-2 font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Number of Volunteers Needed
            </label>
            <input
              type="number"
              value={formData.volunteersNeeded}
              onChange={(e) => setFormData({ ...formData, volunteersNeeded: e.target.value })}
              placeholder="e.g., 20"
              min="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-2 font-medium">Event Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event, what volunteers will do, and any special requirements..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              required
            />
          </motion.div>

          {/* Event Photo Upload */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.52 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-4 font-medium flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-primary" />
              Event Photo
            </label>

            {photoPreview ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                <img src={photoPreview} alt="Event Preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 hover:scale-105 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors bg-gray-50 hover:bg-white"
              >
                <ImagePlus className="w-8 h-8 mb-2" />
                <span className="font-medium">Click to upload an image</span>
                <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
          </motion.div>

          {/* Compensation Type */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-4 font-medium flex items-center gap-2">
              <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold">₹</div>
              Compensation Type
            </label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPaid: false, paymentAmount: "" })}
                className={`flex-1 py-3 px-4 rounded-[1rem] border-2 transition-all text-sm font-bold ${!formData.isPaid ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                Unpaid / Volunteer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPaid: true })}
                className={`flex-1 py-3 px-4 rounded-[1rem] border-2 transition-all text-sm font-bold ${formData.isPaid ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                Paid Role
              </button>
            </div>

            {formData.isPaid && (
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Payment Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                    placeholder="e.g., 500"
                    min="0"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required={formData.isPaid}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Required Skills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100"
          >
            <label className="block mb-4 font-medium">
              Required Skills (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-4 rounded-[1rem] border-2 transition-all text-sm font-medium ${formData.skills.includes(skill)
                    ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowCustomSkill(!showCustomSkill)}
                className={`py-3 px-6 rounded-full border-2 border-dashed transition-all text-sm font-bold ${showCustomSkill ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600"
                  }`}
              >
                + Other (Custom Skill)
              </button>
            </div>

            {showCustomSkill && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Enter custom skill..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomSkillAdd();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCustomSkillAdd}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {formData.skills.length > 0 && (
              <div className="mt-6 p-4 bg-violet-50 rounded-[1rem] border border-violet-100">
                <p className="text-sm text-violet-700 font-bold mb-3 uppercase tracking-wide">
                  ✓ {formData.skills.length} skill{formData.skills.length > 1 ? "s" : ""} selected for this event:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 text-violet-700 rounded-full text-[11px] font-bold shadow-sm uppercase">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className="text-violet-400 hover:text-red-500 transition-colors ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="sticky bottom-20 md:bottom-6"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white py-4 rounded-full font-bold transition-all text-lg flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-fuchsia-500/20'}`}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
