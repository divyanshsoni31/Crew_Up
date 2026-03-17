import { ArrowLeft, Star, Calendar, Users, MapPin, Share2, Award, TrendingUp } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";

const MOCK_ORGANIZATIONS = [
    { id: 1, name: "City Cleanup Crew", role: "Lead Organizer", joined: "Jan 2025" },
    { id: 2, name: "RunForGood", role: "Event Coordinator", joined: "Mar 2025" },
];

const RECENT_REVIEWS = [
    { id: 1, event: "City Marathon Support", rating: 5, text: "Amazing organizer, very clear instructions and great support throughout the event.", user: "Alex R." },
    { id: 2, name: "Community Food Drive", rating: 4.8, text: "Well coordinated and impactful. Enjoyed working under this organization.", user: "Sam T." },
];

export function OrganizerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const profile = {
        name: "Sarah Johnson",
        avatar: "🎯",
        rating: 4.9,
        totalEvents: 45,
        totalVolunteers: 1250,
        location: "San Francisco, CA",
        memberSince: "Jan 2024",
        bio: "Passionate event organizer specializing in community outreach and large-scale public events. My goal is to bridge the gap between causes and willing volunteers.",
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-24 shadow-md">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 transition-all">
                {/* Profile Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl shadow-xl p-6 mb-6"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-fuchsia-500/20 ring-4 ring-white">
                            {profile.avatar}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                {profile.location}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="font-medium">{profile.rating}</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">Organizer since {profile.memberSince}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-violet-50/50 border border-violet-100 rounded-[1.5rem]">
                            <Calendar className="w-6 h-6 text-violet-600 mb-2" />
                            <div className="text-2xl font-extrabold text-gray-900">{profile.totalEvents}</div>
                            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">Events Organized</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-fuchsia-50/50 border border-fuchsia-100 rounded-[1.5rem]">
                            <Users className="w-6 h-6 text-fuchsia-600 mb-2" />
                            <div className="text-2xl font-extrabold text-gray-900">{profile.totalVolunteers}</div>
                            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">Volunteers Managed</div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h3 className="font-bold text-lg mb-2">About Me</h3>
                        <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                </motion.div>

                {/* Organizations Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-primary" />
                        Organizations
                    </h2>
                    <div className="space-y-4">
                        {MOCK_ORGANIZATIONS.map((org) => (
                            <div key={org.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{org.name}</h4>
                                    <p className="text-sm text-muted-foreground">{org.role}</p>
                                </div>
                                <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    Since {org.joined}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Reviews */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        Recent Reviews
                    </h2>
                    <div className="space-y-4">
                        {RECENT_REVIEWS.map((review) => (
                            <div key={review.id} className="p-4 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-sm text-gray-900">{review.event || review.name}</h4>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        <span className="font-medium text-sm">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 block italic">"{review.text}"</p>
                                <div className="text-xs text-muted-foreground text-right">- {review.user}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
