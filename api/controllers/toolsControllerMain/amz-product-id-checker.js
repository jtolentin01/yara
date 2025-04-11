const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const amzProductIdInit = async (req, res, next, batchId) => {
    const { productType, productIDs, marketPlace } = req.body;
    const results = [];
    const productIDChunks = chunkArray(productIDs, 20);
    try {
        const amazonApiToken = await generateLWAaccessToken();
        const amzProductIdExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `identifiers=${identifiers}`,
                    `identifiersType=${productType}`,
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                    `includedData=identifiers`,
                    `pageSize=20`
                ];
                const queryString = queryStringArr.join('&');
                const url = `${baseUrl}?${queryString}`;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        resolve([data]);
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

        const extractResult = (data) => {
            const asinArray = [];
            data.forEach((entry) => {
                if (Array.isArray(entry.items)) {
                    entry.items.forEach((item) => {
                        if (item.asin) {
                            const identifierString = item.identifiers[0]?.identifiers?.map(id => `${id.identifierType}(${id.identifier})`).join(',');
                            asinArray.push({
                                asin: item.asin,
                                identifiers: identifierString || '-',
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await amzProductIdExec(amazonApiToken, chunk);
            results.push(...chunkResult);
            await delay(800);
            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }
        
        const initialResult = extractResult(results);

        let headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Product ID In Amazon", key: "identifiers", width: 15 },
        ];

        let renderFile = await createExcelFile(headers, initialResult);

        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchProgress(batchId, 100);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({'success':true});

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, {error:error.message});
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = amzProductIdInit;
