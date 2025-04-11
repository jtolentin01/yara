const { getCookieForB2b } = require('../../middlewares/amz-api');
const { uploadFileToS3 } = require('../../middlewares/aws');
const { createExcelFile } = require('../../utils/excel-utils');
const {chunkArray} = require('../../utils/array-utils');
const { delay,randomDelay } = require('../../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../../middlewares/msc');
const moment = require('moment');

const asicsInit = async (req, res, next, batchId) => {
    try {
        const cookie = await getCookieForB2b('b2b-asics');
        const deliveryDate = moment().add(-1, 'days').format('YYYY-MM-DD');
        const { productIDs } = req.body;
        let result = [];

        const getCurrentBasket = async (maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://b2b.asics.com/aac/baskets/current`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} in getting current basket`);
                        }
                        const data = await response.json();
                        resolve(data.no);
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

        const basketNo = await getCurrentBasket();

        const getPricesExec = async (style, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://b2b.asics.com/aac/products/${style}/prices?basket_no=${basketNo}&season=at-once&requested_delivery_date=${deliveryDate}`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000,3000)
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} in getting prices`);
                        }
                        const data = await response.json();
                        resolve(data.data);
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

        const processProductChunk = async (chunk) => {
            return Promise.all(chunk.map(async (productId) => {
                const exec = await getPricesExec(productId);
                if (!exec[0]?.itemNo) {
                    return {
                        itemNo: `${productId}`,
                        colorCode: '-',
                        date: '-',
                        discount: "-",
                        wholesalePrice: "-",
                        discountedWholesalePrice: '-',
                        suggestedRetailPrice: '-',
                    };
                } else {
                    exec.forEach(obj => {
                        obj.date = deliveryDate;
                    });
                    return exec;
                }
            }));
        };

        const productChunks = chunkArray(productIDs, 5);
        for (let i = 0; i < productChunks.length; i++) {
            const chunkResults = await processProductChunk(productChunks[i]);

            result.push(...chunkResults.flat());
            const progress = Math.round(((i + 1) / productIDs.length) * 100);
            await updateBatchProgress(batchId, progress);
            await delay(800); 
        }

        let headers = [
            { header: "Style", key: "itemNo", width: 10 },
            { header: "Color", key: "colorCode", width: 10 },
            { header: "Date", key: "date", width: 10 },
            { header: "Discount", key: "discount", width: 10 },
            { header: "Wholesale Price", key: "wholesalePrice", width: 15 },
            { header: "Discounted Wholesale Price", key: "discountedWholesalePrice", width: 15 },
            { header: "SRP", key: "suggestedRetailPrice", width: 10 },
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

module.exports = asicsInit;
