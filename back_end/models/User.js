import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () { return !this.googleId; }, // Required only if not signing up via Google
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['volunteer', 'organizer', 'admin'],
        default: 'volunteer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    hasCompletedProfile: {
        type: Boolean,
        default: false,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
}, { timestamps: true });

// Pre-save hook to hash passwords
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
