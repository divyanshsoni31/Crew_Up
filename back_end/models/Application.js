import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    message: {
        type: String,
        default: '',
    },
}, {
    timestamps: true
});

// Compound index to ensure a volunteer can only apply to a specific event once
applicationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
