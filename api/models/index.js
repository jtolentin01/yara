const mongoose = require('mongoose');
const ckey = require('ckey');

const connectDB = async () => {
    try {
        const address = ckey.DB_ADDR;
        await mongoose.connect(address);
    } catch (error) {
        throw new Error(error);
        
    };
};

module.exports = { connectDB };