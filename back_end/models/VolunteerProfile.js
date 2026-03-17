import mongoose from 'mongoose';

const volunteerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profileCompletionPercentage: {
        type: Number,
        default: 0
    },
    totalXP: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        default: "New Volunteer",
        enum: ["New Volunteer", "Active Volunteer"]
    },
    // Mandatory Personal Details
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    city: { type: String, default: "" },
    bio: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    // Preferences & Skills
    interests: [{ type: String }],
    skills: [{ type: String }],
    availability: { type: String, default: "" },
    preferredVolunteeringType: { type: String, default: "", enum: ["", "online", "offline", "both"] }
}, { timestamps: true });

const VolunteerProfile = mongoose.model('VolunteerProfile', volunteerProfileSchema);
export default VolunteerProfile;
