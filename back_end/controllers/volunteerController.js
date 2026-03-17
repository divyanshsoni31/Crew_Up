import VolunteerProfile from '../models/VolunteerProfile.js';
import User from '../models/User.js';

// Helper to compute completion percentage
const calculateCompletion = (profile) => {
    let completedFields = 0;
    const requiredFields = [
        'phone', 'dob', 'city', 'bio', 'profilePhoto',
        'availability', 'preferredVolunteeringType'
    ];

    requiredFields.forEach(field => {
        if (profile[field] && profile[field] !== "") completedFields++;
    });

    // Check arrays separately
    if (profile.interests && profile.interests.length > 0) completedFields++;
    if (profile.skills && profile.skills.length > 0) completedFields++;

    const totalFields = requiredFields.length + 2; // +2 for interests and skills arrays
    return Math.round((completedFields / totalFields) * 100);
};

// @desc    Get volunteer profile
// @route   GET /api/volunteer/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        let profile = await VolunteerProfile.findOne({ user: req.user._id }).populate('user', 'name email').lean();

        // If not explicit, return an empty husk for the frontend to bind to
        if (!profile) {
            return res.status(200).json({
                profileCompletionPercentage: 0,
                totalXP: 0,
                level: 1,
                status: "New Volunteer"
            });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching volunteer profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Setup / Update volunteer profile
// @route   POST /api/volunteer/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { phone, dob, city, bio, interests, skills, availability, preferredVolunteeringType } = req.body;

        let profilePhoto = req.body.profilePhoto;
        if (req.file) {
            profilePhoto = `/uploads/${req.file.filename}`;
        }

        // Parse array data coming from FormData
        const parsedInterests = interests ? (Array.isArray(interests) ? interests : JSON.parse(interests)) : [];
        const parsedSkills = skills ? (Array.isArray(skills) ? skills : JSON.parse(skills)) : [];

        let profile = await VolunteerProfile.findOne({ user: req.user._id });

        if (!profile) {
            profile = new VolunteerProfile({ user: req.user._id });
        }

        // Update Fields
        if (phone) profile.phone = phone;
        if (dob) profile.dob = dob;
        if (city) profile.city = city;
        if (bio) profile.bio = bio;
        if (profilePhoto) profile.profilePhoto = profilePhoto;
        if (parsedInterests.length > 0) profile.interests = parsedInterests;
        if (parsedSkills.length > 0) profile.skills = parsedSkills;
        if (availability) profile.availability = availability;
        if (preferredVolunteeringType) profile.preferredVolunteeringType = preferredVolunteeringType;

        // Calculate and apply logic
        const completion = calculateCompletion(profile);
        profile.profileCompletionPercentage = completion;

        if (completion === 100 && profile.status === "New Volunteer") {
            profile.status = "Active Volunteer";
            profile.totalXP += 50; // Bonus for completing!

            // Mark user natively as complete to override ProtectedRoute lock
            await User.findByIdAndUpdate(req.user._id, { hasCompletedProfile: true });
        }

        await profile.save();
        res.status(200).json(profile);

    } catch (error) {
        console.error('Error updating volunteer profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
