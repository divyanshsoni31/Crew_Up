import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import VolunteerProfile from './models/VolunteerProfile.js';

dotenv.config();

const seed = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewup';
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const usersToCreate = [];
        for(let i=1; i<=15; i++) {
            usersToCreate.push({
                name: `Demo Volunteer ${i}`,
                email: `demo${i}@volunteer.com`,
                password: 'password123',
                role: 'volunteer',
                isVerified: true,
                hasCompletedProfile: true
            });
        }
        
        // Use create() to trigger pre-save hooks to hash the passwords !!
        const createdUsers = [];
        for (const u of usersToCreate) {
             const user = await User.create(u);
             createdUsers.push(user);
        }
        
        console.log(`Created ${createdUsers.length} users (hashed passwords).`);

        const profilesToCreate = createdUsers.map(u => ({
            user: u._id,
            profileCompletionPercentage: 100,
            status: "Active Volunteer",
            phone: `555000${u._id.toString().slice(-4)}`,
            dob: new Date('1990-01-01'),
            city: "New York",
            bio: "I am a demo volunteer ready to help out!",
            interests: ["Education", "Environment"],
            skills: ["Communication", "Management"],
            availability: "Flexible",
            preferredVolunteeringType: "both"
        }));

        await VolunteerProfile.insertMany(profilesToCreate);
        console.log(`Created ${profilesToCreate.length} profiles.`);
        
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
