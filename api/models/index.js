const mongoose = require('mongoose');
const ckey = require('ckey');

const users = require('./schema-users');
const batches = require('./schema-batches');
const env = require('./schema-env');
const reports = require('./schema-reports');
const words = require('./schema-words');
const parserbatches = require('./schema-parser');
const chats = require('./schema-chats');

const connectDB = async () => {
    try {
        const address = ckey.DB_ADDR;
        await mongoose.connect(address, {
            maxPoolSize: 50,  
            minPoolSize: 1,  
            maxIdleTimeMS: 30000, 
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000 
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw new Error(error);
    }
};

const closeDBConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

const restartDBConnection = async (delay = 2000) => {
    await closeDBConnection();
    console.log(`Waiting for ${delay / 1000} seconds before reconnecting...`);
    setTimeout(async () => {
        try {
            await connectDB();
            console.log('MongoDB connection restarted successfully');
        } catch (error) {
            console.error('Failed to restart MongoDB connection:', error);
        }
    }, delay);
}

module.exports = { connectDB, restartDBConnection,  batches,users,env,reports,words,parserbatches,chats };