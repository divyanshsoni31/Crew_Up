import User from '../models/User.js';
import VolunteerProfile from '../models/VolunteerProfile.js';
import Event from '../models/Event.js';
import Application from '../models/Application.js';

// @desc    Get all users for Admin Dashboard
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        // Map Mongoose documents to the format expected by the frontend AdminUsers table
        const formattedUsers = users.map(u => {
            let status = 'Pending';
            if (u.isSuspended) {
                status = 'Suspended';
            } else if (u.isVerified) {
                status = 'Active';
            }

            return {
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role.charAt(0).toUpperCase() + u.role.slice(1), // Capitalize first letter
                status: status,
                joined: new Date(u.createdAt).toISOString().split('T')[0] // Return YYYY-MM-DD
            };
        });

        res.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users for admin:', error);
        res.status(500).json({ message: 'Server error retrieving users' });
    }
};

// @desc    Update a user's status (Suspend/Activate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
    const { status } = req.body;

    // Safety check - Can only set explicitly to Active or Suspended via this route
    if (!['Active', 'Suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update requested' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Keep them verified, but toggle their suspension boolean
        if (status === 'Suspended') {
            user.isSuspended = true;
        } else if (status === 'Active') {
            user.isSuspended = false;
            user.isVerified = true; // Forcing them back to active also forces verification logic past OTPs.
        }

        await user.save();

        res.json({ message: `User successfully ${status === 'Suspended' ? 'suspended' : 'activated'}`, status });

    } catch (error) {
        console.error('Error updating status for admin:', error);
        res.status(500).json({ message: 'Server error processing status update' });
    }
};

// @desc    Update a user's details (Super Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    const { name, email, role, status } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        if (role) user.role = role.toLowerCase();

        if (status === 'Suspended') {
            user.isSuspended = true;
        } else if (status === 'Active') {
            user.isSuspended = false;
            user.isVerified = true;
        } else if (status === 'Pending') {
            user.isSuspended = false;
            user.isVerified = false;
        }

        await user.save();

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascading deletes based on user role
        if (user.role === 'volunteer') {
            // Delete the volunteer's profile
            await VolunteerProfile.deleteOne({ user: user._id });

            // Delete all applications made by this volunteer
            // Note: This does not adjust the accepted/applicants counters on the Event model 
            // to keep historical stats intact, but the referencing application is removed.
            await Application.deleteMany({ volunteerId: user._id });
        } else if (user.role === 'organizer') {
            // Find all events created by this organizer
            const events = await Event.find({ organizerId: user._id });
            const eventIds = events.map(e => e._id);

            // Delete all applications for these events
            await Application.deleteMany({ eventId: { $in: eventIds } });

            // Delete the events themselves
            await Event.deleteMany({ organizerId: user._id });
        }

        await user.deleteOne();
        res.json({ message: 'User and all associated data completely removed' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        // Parallelize all independent DB queries to drastically reduce response time
        const [
            totalUsers,
            totalVolunteers,
            totalOrganizers,
            recentUsersRaw,
            pendingVerificationsRaw
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'volunteer' }),
            User.countDocuments({ role: 'organizer' }),
            User.find().select('-password -otp -otpExpires').sort({ createdAt: -1 }).limit(4),
            Event.find({ status: 'pending' }).populate('organizerId', 'name').sort({ createdAt: -1 })
        ]);

        // Active Events is mocked for now since the Event schema isn't robustly attached yet
        const activeEvents = 0;

        // Map them into the UI format expected by the frontend
        const recentUsers = recentUsersRaw.map(u => {
            // Map DB verification to UI status definitions
            let status = 'Pending';
            if (u.isSuspended) status = 'Suspended';
            else if (u.isVerified) status = 'Active';

            // Format joined date to relative string broadly used in mock (e.g., '1 day ago')
            const date = new Date(u.createdAt);
            const now = new Date();
            const diffMs = now - date;
            const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);

            let joinedString = '';
            if (diffHrs < 1) joinedString = 'Just now';
            else if (diffHrs < 24) joinedString = `${diffHrs} hours ago`;
            else joinedString = `${Math.floor(diffHrs / 24)} days ago`;

            return {
                id: u._id.toString(),
                name: u.name,
                email: u.email,
                role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
                status: status,
                joined: joinedString
            };
        });

        const pendingVerifications = pendingVerificationsRaw.map(e => {
            const date = new Date(e.createdAt);
            const now = new Date();
            const diffMs = now - date;
            const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);

            let submittedString = '';
            if (diffHrs < 1) submittedString = 'Just now';
            else if (diffHrs < 24) submittedString = `${diffHrs} hours ago`;
            else submittedString = `${Math.floor(diffHrs / 24)} days ago`;

            return {
                id: e._id.toString(),
                organizer: e.title, // Map Event title to the bold text in UI
                document: e.organizerId?.name || "Unknown Organizer", // Map Organizer to the subtext 
                submitted: submittedString
            };
        });

        res.status(200).json({
            stats: {
                totalUsers,
                totalVolunteers,
                totalOrganizers,
                activeEvents
            },
            recentUsers,
            pendingVerifications
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error generating dashboard statistics." });
    }
};

// @desc    Get detailed user profile including Volunteer stats
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let status = 'Pending';
        if (user.isSuspended) status = 'Suspended';
        else if (user.isVerified) status = 'Active';

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            status: status,
            joined: new Date(user.createdAt).toISOString().split('T')[0],
            hasCompletedProfile: user.hasCompletedProfile || false
        };

        // If it's a Volunteer, try to fetch their deep profile metrics
        if (user.role === 'volunteer') {
            const profile = await VolunteerProfile.findOne({ user: user._id });
            if (profile) {
                // Attach safe public volunteer metrics
                userData.volunteerDetails = {
                    city: profile.city,
                    phone: profile.phone,
                    dob: profile.dob,
                    bio: profile.bio,
                    skills: profile.skills,
                    interests: profile.interests,
                    availability: profile.availability,
                    preferredVolunteeringType: profile.preferredVolunteeringType,
                    profileCompletionPercentage: profile.profileCompletionPercentage,
                    totalXP: profile.totalXP,
                    level: profile.level,
                    volunteerStatus: profile.status,
                    profilePhoto: profile.profilePhoto
                };
            }
        }

        res.json(userData);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error retrieving detailed user profile.' });
    }
};
