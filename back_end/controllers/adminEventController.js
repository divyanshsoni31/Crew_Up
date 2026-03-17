import Event from '../models/Event.js';

// @desc    Get all events for the Admin dashboard
// @route   GET /api/admin/events
// @access  Private/Admin
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizerId', 'name email') // Fetch the organizer's basic details 
            .sort({ createdAt: -1 });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching admin events:', error);
        res.status(500).json({ message: 'Server error retrieving events.' });
    }
};

// @desc    Update an event's status (Approve/Reject)
// @route   PATCH /api/admin/events/:id/status
// @access  Private/Admin
export const updateEventStatus = async (req, res) => {
    const { status } = req.body;

    // Safety check ensuring we only allow valid status transitions
    if (!['upcoming', 'cancelled', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update requested' });
    }

    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = status;
        await event.save();

        res.status(200).json({
            message: `Event status successfully updated to ${status}`,
            event
        });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ message: 'Server error processing status update' });
    }
};
