const { getSellerCentralCookie } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay, convertDateFormat, formatDateToMMDDYYYY } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo,updateBatchTotalItems } = require('../middlewares/msc');

const vocScraperInit = async (req, res, next, batchId) => {
    try {
        const { marketPlace } = req.body;
        const oeCookie = await getSellerCentralCookie(marketPlace);
        const result = [];
        const pcxHealths = ['VERY_POOR', 'POOR'];
        let totalSum = 0;
        let processedCount = 0;
        const vocScraperExec = async (pcxHealth, offset, maxRetries = 3, delayMs = 2000) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/pcrHealth/pcrListingSummary?searchText=&pageSize=25&pageOffset=${offset}&sortColumn=ORDERS_COUNT&sortDirection=DESCENDING&pcxHealth=${pcxHealth}&insufficientFeedback=false`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': oeCookie.cookie }
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        resolve(data);
                        await delay(delayMs);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                fetchData(maxRetries);
            });
        };

        const getTotalListingsCount = async (pcxHealth, maxRetries = 3, delayMs = 2000) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/pcrHealth/pcrListingSummary?searchText=&pageSize=25&pageOffset=0&sortColumn=ORDERS_COUNT&sortDirection=DESCENDING&pcxHealth=${pcxHealth}&insufficientFeedback=false`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': oeCookie.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        resolve(data.totalListingsCount);
                        await delay(delayMs);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                fetchData(maxRetries);
            });
        };
        const formatString = (inputString) => {
            const input = inputString.startsWith("ui_") ? inputString.slice(3) : inputString;
            return input
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        };

        for (let i = 0; i < pcxHealths.length; i++) {
            const countInit = await getTotalListingsCount(pcxHealths[i]);
            totalSum += parseInt(countInit, 10);
        }

        await updateBatchTotalItems(batchId,totalSum);

        for (let i = 0; i < pcxHealths.length; i++) {
            const pcxHealth = pcxHealths[i];
        
            const totalListingsCount = await getTotalListingsCount(pcxHealth);
            let cycles = Math.ceil(parseInt(totalListingsCount, 10) / 25) || 0;
        
            for (let j = 0; j < cycles; j++) {
                let offset = j * 25;
        
                let data = await vocScraperExec(pcxHealth, offset);
                data = data.pcrListings;
        
                data.forEach((item) => {
                    let formattedDate = formatDateToMMDDYYYY(item.lastUpdate); 
                    let dataObject = {
                        sku: item.fnsku || item.mskus,
                        asin: item.asin,
                        title: item.itemName,
                        condition: item.condition,
                        fulfillment: item.fulfillmentChannel === 'FBA' ? 'Amazon' : 'Merchant',
                        ncxRate: `${(item.ncxRate * 100).toFixed(2)}%`,
                        ncxOrders: item.ncxCount,
                        totalOrders: item.orderCount,
                        topReturnReason: item.mostCommonReturnReasonBucket ? formatString(item.mostCommonReturnReasonBucket) : '-',
                        topReturnReasonPercent: item.mostCommonReturnReasonBucket ? `${item.mostCommonReturnReasonBucketPercent}%` : '-',
                        lastUpdate: formattedDate,
                        cxHealth: formatString(item.pcxHealth)
                    };
                    result.push(Object.values(dataObject));
                });
        
                processedCount += data.length; 
        
                const progress = (processedCount / totalSum) * 100; 
                await updateBatchProgress(batchId, progress.toFixed(2)); 
            }
        }
        
        let headers = [
            { header: "SKU", key: "sku", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Title", key: "title", width: 15 },
            { header: "Condition", key: "condition", width: 15 },
            { header: "Fulfilled By", key: "fulfillment", width: 15 },
            { header: "NCX Rate", key: "ncxRate", width: 15 },
            { header: "NCX Orders", key: "ncxOrders", width: 15 },
            { header: "Total Orders", key: "totalOrders", width: 15 },
            { header: "Top Return Reason", key: "topReturnReason", width: 15 },
            { header: "Top Return Reason Percent", key: "topReturnReasonPercent", width: 15 },
            { header: "Last Update", key: "lastUpdate", width: 15 },
            { header: "CX Health", key: "cxHealth", width: 15 },
        ];

        let renderFile = await createExcelFile(headers, result);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchProgress(batchId, 100);
        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = vocScraperInit;
