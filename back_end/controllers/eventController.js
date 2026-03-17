import Event from '../models/Event.js';
import Application from '../models/Application.js';
import VolunteerProfile from '../models/VolunteerProfile.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer)
export const createEvent = async (req, res) => {
    try {
        const {
            title, fromDate, toDate, fromTime, toTime, location, volunteersNeeded,
            description, skills, isPaid, paymentAmount
        } = req.body;

        // Verify the user requesting this is flagged as an Organizer
        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Only Organizers can create events' });
        }

        // Validate that the Event fromDate is not set in the past
        const today = new Date().toISOString().split('T')[0];
        if (fromDate < today || toDate < fromDate) {
            return res.status(400).json({ message: 'Invalid event dates provided' });
        }

        // Process Multer file path if a photo was uploaded successfully
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Handle skills array parsing since FormData sends it as a stringified array
        let parsedSkills = [];
        if (skills) {
            try {
                parsedSkills = JSON.parse(skills);
            } catch (e) {
                // If not JSON, it might just be a comma separated string
                parsedSkills = typeof skills === 'string' ? skills.split(',') : skills;
            }
        }

        const event = await Event.create({
            organizerId: req.user._id,
            title,
            fromDate,
            toDate,
            fromTime,
            toTime,
            location,
            volunteersNeeded: Number(volunteersNeeded),
            description,
            skills: parsedSkills,
            isPaid: isPaid === 'true', // FormData sends booleans as 'true'/'false' strings
            paymentAmount: Number(paymentAmount) || 0,
            photoUrl
        });

        res.status(201).json(event);

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error parsing event data.' });
    }
};

// @desc    Get all active/upcoming events for the Volunteer discovery page
// @route   GET /api/events
// @access  Private
export const getAllUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'upcoming' })
            .populate('organizerId', 'name rating eventsHosted')
            .sort({ date: 1 })
            .lean(); // Use lean to allow mutation

        // Dynamically calculate accurate "accepted" counts to heal manual DB manipulations
        const eventIds = events.map(e => e._id);
        const acceptedCounts = await Application.aggregate([
            { $match: { eventId: { $in: eventIds }, status: 'accepted' } },
            { $group: { _id: '$eventId', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        acceptedCounts.forEach(c => countMap[c._id.toString()] = c.count);

        events.forEach(event => {
            event.accepted = countMap[event._id.toString()] || 0;

            // Background heal to DB schema (optional but keeps DB clean)
            Event.updateOne({ _id: event._id }, { $set: { accepted: event.accepted } }).exec();
        });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching all upcoming events:', error);
        res.status(500).json({ message: 'Server error retrieving public events.' });
    }
};

// @desc    Get all events strictly bound to the logged-in organizer
// @route   GET /api/events/organizer
// @access  Private (Organizer)
export const getOrganizerEvents = async (req, res) => {
    try {
        // Query database matching the auth token's embedded User ID
        const events = await Event.find({ organizerId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Dynamically calculate accurate "accepted" and "pending" counts to heal manual DB manipulations
        const eventIds = events.map(e => e._id);
        const [acceptedCounts, pendingCounts] = await Promise.all([
            Application.aggregate([
                { $match: { eventId: { $in: eventIds }, status: 'accepted' } },
                { $group: { _id: '$eventId', count: { $sum: 1 } } }
            ]),
            Application.aggregate([
                { $match: { eventId: { $in: eventIds }, status: 'pending' } },
                { $group: { _id: '$eventId', count: { $sum: 1 } } }
            ])
        ]);

        const countMap = {};
        acceptedCounts.forEach(c => countMap[c._id.toString()] = c.count);

        const pendingMap = {};
        pendingCounts.forEach(c => pendingMap[c._id.toString()] = c.count);

        events.forEach(event => {
            event.accepted = countMap[event._id.toString()] || 0;
            event.applicants = pendingMap[event._id.toString()] || 0;

            // Background repair sync 
            Event.updateOne({ _id: event._id }, { $set: { accepted: event.accepted } }).exec();
        });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching organizer events:', error);
        res.status(500).json({ message: 'Server error retrieving events.' });
    }
};

// @desc    Get singular event details
// @route   GET /api/events/:id
// @access  Private (Organizer)
export const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizerId', 'name rating eventsHosted')
            .lean();

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Always serve mathematically pure Application aggregations
        const actualAcceptedCount = await Application.countDocuments({
            eventId: event._id,
            status: 'accepted'
        });

        event.accepted = actualAcceptedCount;

        // Background DB repair
        Event.updateOne({ _id: event._id }, { $set: { accepted: actualAcceptedCount } }).exec();

        // We specifically WANT volunteers to be able to read this endpoint.
        // If it's the organizer, they can view it regardless of status.
        // If it's a Volunteer, they should probably only see 'upcoming' or 'completed' events.
        if (event.organizerId._id.toString() !== req.user._id.toString() && event.status === 'pending') {
            return res.status(403).json({ message: 'Unauthorized. Event is pending admin approval.' });
        }

        res.status(200).json(event);

    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ message: 'Server error retrieving details.' });
    }
};

// @desc    Get applications for a specific event
// @route   GET /api/events/:id/applications
// @access  Private (Organizer)
export const getEventApplications = async (req, res) => {
    try {
        // First verify the event exists and the user owns it
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You do not own this event.' });
        }

        // Fetch applications and join Volunteer (User) details 
        const applications = await Application.find({ eventId: req.params.id })
            .populate('volunteerId', 'name email skills')
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server error retrieving applications.' });
    }
};

// @desc    Update a specific application's status
// @route   PATCH /api/events/:eventId/applications/:applicationId/status
// @access  Private (Organizer)
export const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update requested.' });
    }

    try {
        // Verify the parent event is owned by the logged in organizer
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to modify these applications.' });
        }

        // Find the specific application
        const application = await Application.findById(req.params.applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Prevent updating if already accepted and attempting to accept again
        if (application.status === 'accepted' && status === 'accepted') {
            return res.status(400).json({ message: 'Application is already accepted.' });
        }

        // Handle the dynamic update of the Event's 'accepted' counter metric
        if (status === 'accepted') {
            // Ensure they haven't maxed out their slots
            if (event.accepted >= event.volunteersNeeded) {
                return res.status(400).json({ message: 'Event volunteer capacity is already full.' });
            }
            // If they are moving from a state other than accepted, increment
            if (application.status !== 'accepted') {
                event.accepted += 1;
                await event.save();
            }
        } else if (application.status === 'accepted' && status !== 'accepted') {
            // If they are downgrading an already accepted application back to rejected/pending, decrement
            event.accepted -= 1;
            await event.save();
        }

        // Save the new application status
        application.status = status;
        await application.save();

        res.status(200).json({ message: `Application ${status}`, application });

    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Server error parsing status update.' });
    }
};

// @desc    Apply for an Event
// @route   POST /api/events/:id/apply
// @access  Private (Volunteer)
export const applyForEvent = async (req, res) => {
    try {
        // Prevent Organizers or Admins from applying
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Only Volunteers can apply for events.' });
        }

        const eventId = req.params.id;
        const volunteerId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'upcoming') {
            return res.status(400).json({ message: 'You can only apply to Upcoming events.' });
        }

        if (event.accepted >= event.volunteersNeeded) {
            return res.status(400).json({ message: 'Event volunteer capacity is already full.' });
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({ eventId, volunteerId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this event.' });
        }

        // Create the application
        const application = await Application.create({
            eventId,
            volunteerId,
            status: 'pending',
            message: req.body.message || ''
        });

        res.status(201).json({ message: 'Application submitted successfully!', application });

    } catch (error) {
        console.error('Error applying for event:', error);
        res.status(500).json({ message: 'Server error submitting application.' });
    }
};

// @desc    Get all applications made by the requesting volunteer
// @route   GET /api/events/volunteer/applications
// @access  Private (Volunteer)
export const getVolunteerApplications = async (req, res) => {
    try {
        // Verify user is a volunteer
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Fetch applications. Populate the eventId to get the Event title, date, etc.
        const applications = await Application.find({ volunteerId: req.user._id })
            .populate('eventId')
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching volunteer applications:', error);
        res.status(500).json({ message: 'Server error retrieving applications.' });
    }
};

// @desc    Get all applications for all events owned by the Organizer
// @route   GET /api/events/organizer/applications
// @access  Private (Organizer)
export const getAllOrganizerApplications = async (req, res) => {
    try {
        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Unauthorized. Only organizers can view all their applications.' });
        }

        // 1. Find all events created by this organizer
        const events = await Event.find({ organizerId: req.user._id }).select('_id');
        const eventIds = events.map(e => e._id);

        if (eventIds.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Fetch all applications tied to those events
        const applications = await Application.find({ eventId: { $in: eventIds } })
            .populate('eventId', 'title date photoUrl')
            .populate('volunteerId', 'name email role')
            .sort({ createdAt: -1 });

        // 3. Map deep volunteer metrics
        const populatedApplications = await Promise.all(applications.map(async (app) => {
            let volunteerDetails = null;
            if (app.volunteerId?._id) {
                // Fetch the volunteer's rich profile details
                volunteerDetails = await VolunteerProfile.findOne({ user: app.volunteerId._id })
                    .select('skills level totalXP profilePhoto city');

                // Calculate total completed events for this volunteer by counting accepted past applications
                const totalEvents = await Application.countDocuments({
                    volunteerId: app.volunteerId._id,
                    status: 'accepted'
                });

                volunteerDetails = {
                    ...volunteerDetails?.toObject(),
                    totalEvents
                };
            }

            return {
                ...app.toObject(),
                volunteerDetails
            };
        }));

        res.status(200).json(populatedApplications);

    } catch (error) {
        console.error('Error fetching organizer applications:', error);
        res.status(500).json({ message: 'Server error retrieving applications.' });
    }
};

// @desc    Get dashboard stats for tracking metrics
// @route   GET /api/events/organizer/dashboard
// @access  Private (Organizer)
export const getOrganizerDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Unauthorized. Only organizers can view dashboard stats.' });
        }

        const events = await Event.find({ organizerId: req.user._id }).select('_id title status fromDate toDate');
        const eventIds = events.map(e => e._id);

        let activeEventsCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        events.forEach(e => {
            if (e.status === 'upcoming') {
                if (!e.toDate) {
                    activeEventsCount++;
                } else {
                    const eventDate = new Date(e.toDate);
                    eventDate.setHours(0, 0, 0, 0);
                    if (eventDate >= today) {
                        activeEventsCount++;
                    }
                }
            }
        });

        const [totalApplicationsCount, recentApplications] = await Promise.all([
            Application.countDocuments({ eventId: { $in: eventIds } }),
            Application.find({ eventId: { $in: eventIds } })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('eventId', 'title')
                .populate({ path: 'volunteerId', select: 'name' })
        ]);

        const recentActivity = recentApplications.map(app => {
            return {
                text: `${app.volunteerId?.name || 'A volunteer'} applied for ${app.eventId?.title || 'an event'}`,
                time: app.createdAt
            };
        });

        res.status(200).json({
            activeEvents: activeEventsCount,
            totalApplications: totalApplicationsCount,
            recentActivity
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error retrieving stats.' });
    }
};
