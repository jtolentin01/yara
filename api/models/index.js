const mongoose = require('mongoose');
const ckey = require('ckey');

const users = require('./schema-users');
const batches = require('./schema-batches');

const connectDB = async () => {
    try {
        const address = ckey.DB_ADDR;
        await mongoose.connect(address);
        console.log("Connected to MongoDB");
    } catch (error) {
        throw new Error(error);
        
    };
};

module.exports = { connectDB,batches,users };