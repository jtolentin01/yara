const moment = require('moment-timezone');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const newBatchId = (initial) => {
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const batchName = `${initial}-` + uniqueNumber;
    return batchName;
}

const newUserId = () => {
    const min = 10000; 
    const max = 99999; 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const newTimeStamp = moment().tz('Asia/Manila').format('YYYYMMDDHHmmss');

module.exports = { delay, newBatchId, newTimeStamp, newUserId }