const moment = require('moment-timezone');
const fs = require('fs');
const { checkForDupBatch } = require('../middlewares/msc');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = (minMs, maxMs) => {
    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delayTime));
};
const newBatchId = async (initial) => {
    const generateBatch = () => {
        const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
        return `${initial}-${uniqueNumber}`;
    };

    const batchName = generateBatch();
    const checkDup = await checkForDupBatch(batchName);

    if (checkDup) {
        return newBatchId(initial);
    } else {
        return batchName;
    }
};

const dumpToJsonFile = (data) => {
    try {
        const filePath = "../../../"
        const jsonData = JSON.stringify(data, null, 2);

        fs.writeFileSync(filePath, jsonData, 'utf8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
        console.error('Error writing JSON data to file:', error);
    }
};


const newUserId = () => {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const newticketId = () => {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null;
    }
    const [month, day, year] = [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()
    ].map(part => part.toString().padStart(2, '0'));

    return `${month}/${day}/${year}`;
};

const convertDateFormat = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const formatDateToMMDDYYYY = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return new Date(`${month}/${day}/${year}`);
};

const isPastDate = (inputDate) => {
    const currentDate = new Date();
    const inputDateObject = new Date(inputDate);

    inputDateObject.setUTCHours(0, 0, 0, 0);
    currentDate.setUTCHours(0, 0, 0, 0);

    return inputDateObject <= currentDate;
};


const getProperties = (requestBody) => {
    const guide = [
        { name: "inactiveBlockedRed", filter: "INACTIVE_STRONG_BLOCK" },
        { name: "inactiveBlockedYellow", filter: "INACTIVE_WEAK_BLOCK" },
        { name: "pricingIssues", filter: "INACTIVE_LOW_PRICE_WEAK_BLOCK%22%2C%22INACTIVE_HIGH_PRICE_WEAK_BLOCK" },
        { name: "closed", filter: "INACTIVE_END_DATE_REACHED" },
        { name: "startDateInFuture", filter: "INACTIVE_TO_BE_OPEN" },
        { name: "detailPageRemoved", filter: "INACTIVE_ASIN_SUPPRESSED" },
        { name: "approvalRequired", filter: "INACTIVE_GATED" }
    ];
    const excludedKeys = ['selectAll', 'combineIntoSingleSheet'];
    const trueKeys = [];

    Object.entries(requestBody).forEach(([key, value]) => {
        if (value === true && !excludedKeys.includes(key)) {
            trueKeys.push(key);
        }
    });

    const filters = trueKeys.map(key => {
        const match = guide.find(item => item.name === key);
        return match ? match.filter : null;
    }).filter(filter => filter !== null);

    return filters;
};

const extractTrueValues = (reqBody) => {
    const result = [];
    for (const [key, value] of Object.entries(reqBody)) {
        if (value === true && key !== 'selectAll') {
            result.push(key);
        }
    }
    return result;
};

const convertListingIssue = (dataArray) => {
    const guide = [
        { name: "Inactive Blocked-Red", filter: "INACTIVE_STRONG_BLOCK" },
        { name: "Inactive Blocked-Yellow", filter: "INACTIVE_WEAK_BLOCK" },
        { name: "Pricing Issues", filter: "INACTIVE_LOW_PRICE_WEAK_BLOCK%22%2C%22INACTIVE_HIGH_PRICE_WEAK_BLOCK" },
        { name: "Closed", filter: "INACTIVE_END_DATE_REACHED" },
        { name: "Start Date in Future", filter: "INACTIVE_TO_BE_OPEN" },
        { name: "Detail Page Removed", filter: "INACTIVE_ASIN_SUPPRESSED" },
        { name: "Approval Required", filter: "INACTIVE_GATED" }
    ];
    return dataArray.map(item => {
        const match = guide.find(guideItem => guideItem.filter === item.listingIssue);
        return {
            ...item,
            listingIssue: match ? match.name : item.listingIssue
        };
    });
};

const convertSipv = (dataArray) => {
    const guide = [
        { reason: "AUTOMATED_BRAND_PROTECTION", value: "Suspected Intellectual Property Violations" },
        { reason: "IntellectualProperty", value: "Received Intellectual Property Complaints" },
        { reason: "POSITIVE_CUSTOMER_EXPERIENCE", value: "Other Policy Violations" },
        { reason: "ProductCondition", value: "Product Condition Customer Complaints" },
        { reason: "ProductSafety", value: "Food and Product Safety Issues" },
        { reason: "RESTRICTED_PRODUCTS", value: "Restricted Product Policy Violations" },
        { reason: "ListingPolicy", value: "Listing Policy Violations" }
    ]

    return dataArray.map(item => {
        const match = guide.find(guideItem => guideItem.reason === item.metricName);
        return {
            ...item,
            metricName: match ? match.value : item.metricName
        };
    });
};


const newTimeStamp = moment().tz('Asia/Manila').format('YYYYMMDDHHmmss');

module.exports = { dumpToJsonFile, randomDelay, delay, newBatchId, newTimeStamp, newUserId, getProperties, convertListingIssue, formatDate, newticketId, extractTrueValues, convertSipv, isPastDate, convertDateFormat, formatDateToMMDDYYYY }