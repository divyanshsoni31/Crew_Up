import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Camera, MapPin, Calendar, Phone, FileText, CheckCircle, ArrowRight, Upload, User, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const INTEREST_OPTIONS = ["Education", "Environment", "Medical", "Event Support", "Animal Welfare", "Disaster Relief"];
const SKILL_OPTIONS = ["Communication", "Teaching", "First Aid", "Management", "Photography", "Logistics", "Tech Support"];

export function VolunteerProfileSetup() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Need login to refresh the token context if backend sends new identity

    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        phone: "",
        dob: "",
        city: "",
        bio: "",
        profilePhoto: null as File | null,
        interests: [] as string[],
        skills: [] as string[],
        availability: "",
        preferredVolunteeringType: "both"
    });

    // Location AutoComplete State
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // OSNominatim API query logic
    useEffect(() => {
        const fetchLocation = async () => {
            if (!formData.city || formData.city.trim().length < 3) {
                setLocationSuggestions([]);
                return;
            }
            setIsSearchingLocation(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.city)}&format=json&addressdetails=1&limit=5`);
                const data = await res.json();
                setLocationSuggestions(data);
            } catch (error) {
                console.error("Failed to fetch location data via OpenStreetMap Nominatim", error);
            } finally {
                setIsSearchingLocation(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (showSuggestions) fetchLocation();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.city, showSuggestions]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, profilePhoto: file });
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const calculateProgress = () => {
        let completed = 0;
        const requirements = [
            formData.phone, formData.dob, formData.city, formData.bio,
            formData.profilePhoto, formData.availability, formData.preferredVolunteeringType
        ];
        requirements.forEach(req => req ? completed++ : null);
        if (formData.interests.length > 0) completed++;
        if (formData.skills.length > 0) completed++;
        return Math.round((completed / 9) * 100);
    };

    const toggleArrayItem = (arrayType: 'interests' | 'skills', item: string) => {
        setFormData(prev => {
            const array = prev[arrayType];
            if (array.includes(item)) {
                return { ...prev, [arrayType]: array.filter(i => i !== item) };
            } else {
                return { ...prev, [arrayType]: [...array, item] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Front-end mandatory bounds check
        if (calculateProgress() < 100) {
            toast.error("Please fill out all mandatory fields to complete your profile!");
            return;
        }

        setIsLoading(true);

        try {
            const data = new FormData();
            data.append("phone", formData.phone);
            data.append("dob", formData.dob);
            data.append("city", formData.city);
            data.append("bio", formData.bio);
            data.append("availability", formData.availability);
            data.append("preferredVolunteeringType", formData.preferredVolunteeringType);
            data.append("interests", JSON.stringify(formData.interests));
            data.append("skills", JSON.stringify(formData.skills));

            if (formData.profilePhoto) {
                data.append("profilePhoto", formData.profilePhoto);
            }

            const token = sessionStorage.getItem("crewup_token");
            const res = await fetch(`http://${window.location.hostname}:3000/api/volunteer/profile`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (!res.ok) throw new Error("Failed to save profile");

            const responseData = await res.json();

            // We must trick AuthContext into flipping hasCompletedProfile so the user isn't trapped anymore
            const oldUserStr = sessionStorage.getItem("crewup_user");
            if (oldUserStr && token) {
                const oldUser = JSON.parse(oldUserStr);
                const newUser = { ...oldUser, hasCompletedProfile: true };
                login(newUser, token); // Reshuffles context smoothly
            }

            toast.success("Profile complete! You've earned 50 XP!");
            navigate("/volunteer/dashboard", { replace: true });

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving your profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const progress = calculateProgress();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">

            {/* Dynamic Header */}
            <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-8 pb-32 mb-4 rounded-b-[2.5rem] shadow-lg shadow-fuchsia-500/20 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Complete Profile</h1>
                    <p className="text-violet-100 font-medium mb-6 text-sm">You must complete your profile to explore events.</p>

                    <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/30">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-full"
                        />
                    </div>
                    <p className="text-sm font-bold mt-2 font-mono">{progress}% Complete</p>
                </div>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto px-4 -mt-20 relative z-30 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >

                {/* Profile Photo Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-32 h-32 rounded-full border-4 border-violet-100 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-violet-300 transition-colors bg-gray-50"
                    >
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-violet-500 transition-colors">
                                <Camera className="w-8 h-8 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                            </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                    {(!formData.profilePhoto) && <p className="text-red-500 text-xs mt-2 font-bold font-mono">* Mandatory</p>}
                </div>

                {/* Personal Details */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-violet-500" /> Personal Details
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="relative" ref={suggestionRef}>
                                <label className="block text-sm font-bold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => {
                                            setFormData({ ...formData, city: e.target.value });
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Search your city..."
                                        required
                                    />
                                    {isSearchingLocation && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-spin" />
                                    )}
                                </div>
                                {showSuggestions && locationSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                        {locationSuggestions.map((place: any) => (
                                            <button
                                                key={place.place_id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, city: place.display_name });
                                                    setShowSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-3"
                                            >
                                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                                                <span className="line-clamp-2 leading-tight">{place.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Short Bio <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none h-24"
                                    placeholder="Tell us a little bit about yourself..."
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interests & Skills */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Interests & Skills</h2>
                    <p className="text-xs text-gray-500 mb-6 font-medium">Select at least one option for each to help us match you perfectly.</p>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Causes you care about <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleArrayItem("interests", interest)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.interests.includes(interest)
                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                        {formData.interests.length === 0 && <p className="text-red-500 text-xs mt-2 font-bold font-mono">Select at least 1</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Your Top Skills <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {SKILL_OPTIONS.map(skill => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleArrayItem("skills", skill)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.skills.includes(skill)
                                        ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                        {formData.skills.length === 0 && <p className="text-red-500 text-xs mt-2 font-bold font-mono">Select at least 1</p>}
                    </div>
                </div >

                {/* Availability */}
                < div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100" >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Availability Preferences</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">When are you available? <span className="text-red-500">*</span></label>
                            <select
                                value={formData.availability}
                                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none font-medium text-gray-700 appearance-none"
                                required
                            >
                                <option value="" disabled>Select your availability</option>
                                <option value="Weekdays">Weekdays</option>
                                <option value="Weekends">Weekends</option>
                                <option value="Flexible">Flexible (Anytime)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Environment <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-3">
                                {["online", "offline", "both"].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, preferredVolunteeringType: type })}
                                        className={`py-3 rounded-2xl text-sm font-bold border-2 capitalize transition-all ${formData.preferredVolunteeringType === type
                                            ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div >
                </div >

                {/* Submit Action */}
                < div className="pt-4 pb-12" >
                    <button
                        type="submit"
                        disabled={isLoading || progress < 100}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all ${progress >= 100
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-fuchsia-500/20 hover:scale-[1.02] cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? "Saving..." : "Complete Profile"}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>

            </motion.form>

            {/* Import User manually at the top for missing component fallback if needed */}
            {/* Added missing import User dynamically inside JSX body is a bad idea, let's fix it above */}
        </div>
    );
}

// Ensure the User icon is loaded above inside Lucide react import
