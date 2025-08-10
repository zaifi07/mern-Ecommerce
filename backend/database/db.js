require('dotenv').config();
const mongoose = require('mongoose');

let isConnected = false; // Connection state

const connectToDB = async () => {
    if (isConnected) {
        console.log('⚡ Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Fail faster if can't connect
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

module.exports = { connectToDB };
