import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    fromDate: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    toDate: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    fromTime: {
        type: String, // HH:MM
        required: true,
    },
    toTime: {
        type: String, // HH:MM
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    volunteersNeeded: {
        type: Number,
        required: true,
        min: 1,
    },
    description: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        default: [],
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paymentAmount: {
        type: Number,
        default: 0,
    },
    photoUrl: {
        type: String, // Path to the uploaded image in /uploads
    },
    status: {
        type: String,
        enum: ['pending', 'upcoming', 'completed', 'cancelled'],
        default: 'pending',
    },
    applicants: {
        type: Number,
        default: 0,
    },
    accepted: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
