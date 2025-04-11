const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const getParentInit = async (req, res, next, batchId) => {
    const { productType, productIDs, marketPlace } = req.body;
    const chunkUniqueParentAsins = chunkArray(productIDs, 20);
    const parentResultArr = [];
    try {
        const amazonApiToken = await generateLWAaccessToken();
        const getParentExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `identifiers=${identifiers}`,
                    `identifiersType=${productType}`,
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                    `includedData=attributes,dimensions,identifiers,images,productTypes,relationships,salesRanks,summaries`,
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
                            if (response.status === 429) {
                                await delay(15000); 
                            } else if (response.status === 403) {
                                amazonApiToken = await generateLWAaccessToken();
                                options.headers['x-amz-access-token'] = amazonApiToken;
                            } else {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
        
                            if (retryCount > 0) {
                                await delay(delayMs);
                                return fetchData(retryCount - 1);
                            } else {
                                throw new Error(`Failed after ${maxRetries} retries`);
                            }
                        }
                        const data = await response.json();
                        resolve([data]);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            return fetchData(retryCount - 1);
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
                            const parentAsin = (item.relationships?.[0]?.relationships?.[0]?.parentAsins?.[0]) || '-';
                            asinArray.push({
                                asin: item.asin,
                                parentasin: parentAsin
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        for (let i = 0; i < chunkUniqueParentAsins.length; i++) {
            const chunk = chunkUniqueParentAsins[i];
            const chunkResult = await getParentExec(amazonApiToken, chunk);
            parentResultArr.push(...chunkResult);
            await delay(800);
            const progress = Math.round((i + 1) / chunkUniqueParentAsins.length * 100);
            await updateBatchProgress(batchId, progress);
        }
        const parentResult = extractResult(parentResultArr);
        let headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Parent ASIN", key: "parentasin", width: 15 },
        ];

        let renderFile = await createExcelFile(headers, parentResult);
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

module.exports = getParentInit;
