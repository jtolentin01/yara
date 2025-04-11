const { getCookieForB2b } = require('../../middlewares/amz-api');
const { uploadFileToS3 } = require('../../middlewares/aws');
const { createExcelFile } = require('../../utils/excel-utils');
const { chunkArray } = require('../../utils/array-utils');
const { delay, randomDelay } = require('../../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../../middlewares/msc');

const sauconyInit = async (req, res, next, batchId) => {
    try {
        const cookie = await getCookieForB2b('b2b-saucony');
        const { productIDs } = req.body;
        let result = [];
        const sauconyExec = async (style, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://saucony.orderwwwbrands.com/api/b2b/ats/search`;
                const options = {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie.cookie },
                    body: JSON.stringify({
                        "collectionCode": "US-SA-AO-PERFORMANCE",
                        "atsProductCodes": [
                            `${style}`
                        ]
                    })
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000, 2000)
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} on sauconyExec`);
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

        const sauconyGetPrice = async (style, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://saucony.orderwwwbrands.com/api/b2b/prices/search`;
                const options = {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie.cookie },
                    body: JSON.stringify({
                        "collectionCode": "US-SA-AO-PERFORMANCE",
                        "atsProductCodes": [
                            `${style}`
                        ]
                    })
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000, 2000)
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} on sauconyExec`);
                        }
                        const data = await response.json();
                        resolve(data.data.prices);
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
                const exec = await sauconyExec(productId);
                if (!exec[0]?.productCode) {
                    return {
                        productCode: `${productId}`,
                        skuCode: '-',
                        qty: '-',
                        price: '-'
                    };
                } else {
                    return exec;
                }
            }));
        };

        const productChunks = chunkArray(productIDs, 5);
        for (let i = 0; i < productChunks.length; i++) {
            const chunkResults = await processProductChunk(productChunks[i]);
            result.push(...chunkResults.flat());

            const progress = Math.round((i + 1) / productChunks.length * 100);
            await updateBatchProgress(batchId, progress);

            await delay(800);
        }

        const prices = await sauconyGetPrice();
        
        result.forEach(item => {
            const sku = item.productCode;
            if (sku in prices) {
                item.price = prices[sku]?.priceMin || '-';
            }
        });

        let headers = [
            { header: "Style", key: "productCode", width: 10 },
            { header: "UPC", key: "skuCode", width: 15 },
            { header: "Quantity", key: "qty", width: 10 },
            { header: "Price", key: "price", width: 10 },
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

module.exports = sauconyInit;
