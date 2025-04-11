const { generateLWAaccessToken, getMarketPlaceIDs } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { chunkArray } = require('../utils/array-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const getDimensionInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace,productType } = req.body;
    try {
        const amazonApiToken = await generateLWAaccessToken();
        let result = [];

        const getDimensionExec = async (productIDs, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items?identifiers=${identifiers}&identifiersType=${productType}&marketplaceIds=${getMarketPlaceIDs(marketPlace)}&includedData=dimensions`;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            if (response.status === 429) {
                                await delay(15000);
                            } else if (response.status === 403) {
                                amazonApiToken = await generateLWAaccessToken();
                                options.headers['x-amz-access-token'] = amazonApiToken;
                            } else if (response.status === 400) {
                                resolve([])
                            }
                            else {
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
                            asinArray.push({
                                asin: item.asin,
                                itemHeightUnit: item.dimensions[0]?.item?.height?.unit || '-',
                                itemHeightValue: item.dimensions[0]?.item?.height?.value || '-',
                                itemLengthUnit: item.dimensions[0]?.item?.length?.unit || '-',
                                itemLengthValue: item.dimensions[0]?.item?.length?.value || '-',
                                itemWeightUnit: item.dimensions[0]?.item?.weight?.unit || '-',
                                itemWeightValue: item.dimensions[0]?.item?.weight?.value || '-',
                                itemWidthUnit: item.dimensions[0]?.item?.width?.unit || '-',
                                itemWidthValue: item.dimensions[0]?.item?.width?.value || '-',
                                packageHeightUnit: item.dimensions[0]?.package?.height?.unit || '-',
                                packageHeightValue: item.dimensions[0]?.package?.height?.value || '-',
                                packageLengthUnit: item.dimensions[0]?.package?.length?.unit || '-',
                                packageLengthValue: item.dimensions[0]?.package?.length?.value || '-',
                                packageWeightUnit: item.dimensions[0]?.package?.weight?.unit || '-',
                                packageWeightValue: item.dimensions[0]?.package?.weight?.value || '-',
                                packageWidthUnit: item.dimensions[0]?.package?.width?.unit || '-',
                                packageWidthValue: item.dimensions[0]?.package?.width?.value || '-',
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        const validateResult = (result, productIDs) => {
            const existingProductIds = result.map(product => product.asin);
            productIDs.forEach(id => {
                if (!existingProductIds.includes(id)) {
                    result.push({
                        asin: `${id}`,
                        itemHeightUnit: '-',
                        itemHeightValue: '-',
                        itemLengthUnit: '-',
                        itemLengthValue: '-',
                        itemWeightUnit: '-',
                        itemWeightValue: '-',
                        itemWidthUnit: '-',
                        itemWidthValue: '-',
                        packageHeightUnit: '-',
                        packageHeightValue: '-',
                        packageLengthUnit: '-',
                        packageLengthValue: '-',
                        packageWeightUnit: '-',
                        packageWeightValue: '-',
                        packageWidthUnit: '-',
                        packageWidthValue: '-',
                    });
                }
            });

            return result;
        }

        const productIDChunks = chunkArray(productIDs, 20);

        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await getDimensionExec(chunk);
            result.push(...chunkResult);
            await delay(800);
            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const extractedResult = extractResult(result);
        const validatedResult = validateResult(extractedResult,productIDs);
        
        const headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Item Height Unit", key: "itemHeightUnit", width: 16 },
            { header: "Item Height Value", key: "itemHeightValue", width: 16 },
            { header: "Item Length Unit", key: "itemLengthUnit", width: 16 },
            { header: "Item Length Value", key: "itemLengthValue", width: 16 },
            { header: "Item Weight Unit", key: "itemWeightUnit", width: 16 },
            { header: "Item Weight Value", key: "itemWeightValue", width: 16 },
            { header: "Item Width Unit", key: "itemWidthUnit", width: 16 },
            { header: "Item Width Value", key: "itemWidthValue", width: 16 },
            { header: "Package Height Unit", key: "packageHeightUnit", width: 16 },
            { header: "Package Height Value", key: "packageHeightValue", width: 16 },
            { header: "Package Length Unit", key: "packageLengthUnit", width: 16 },
            { header: "Package Length Value", key: "packageLengthValue", width: 16 },
            { header: "Package Weight Unit", key: "packageWeightUnit", width: 16 },
            { header: "Package Weight Value", key: "packageWeightValue", width: 16 },
            { header: "Package Width Unit", key: "packageWidthUnit", width: 16 },
            { header: "Package Width Value", key: "packageWidthValue", width: 16 },
        ];

        let renderFile = await createExcelFile(headers, validatedResult);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchProgress(batchId, 100);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ 'success': true });
    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = getDimensionInit;
