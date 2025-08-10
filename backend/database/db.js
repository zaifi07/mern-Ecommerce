require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Optional fix for DNS issues
dns.setServers(['8.8.8.8']);

exports.connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};
