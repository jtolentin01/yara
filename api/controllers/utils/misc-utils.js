const moment = require('moment-timezone');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const newBatchId = (initial) => {
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const batchName = `${initial}-` + uniqueNumber;
    return batchName;
}

const newTimeStamp = moment().tz('Asia/Manila').format('YYYYMMDDHHmmss');

module.exports = { delay, newBatchId, newTimeStamp }