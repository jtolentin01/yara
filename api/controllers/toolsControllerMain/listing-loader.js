const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFileWithMultipleTabs } = require('../utils/excel-utils');
const { chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const listingLoaderInit = async (req, res, next, batchId) => {
    const { productType, productIDs, marketPlace } = req.body;
    let results = [];
    try {
        const amazonApiToken = await generateLWAaccessToken();
        const listingLoaderExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1000) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                let pageResults = [];
                let nextPageToken = null;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };

                const fetchData = async (retryCount) => {
                    try {
                        const queryStringArr = [
                            `identifiers=${identifiers}`,
                            `identifiersType=${productType}`,
                            `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                            `includedData=identifiers,attributes,summaries,relationships,productTypes,salesRanks`,
                            `pageSize=20`,
                        ];
                        if (nextPageToken) queryStringArr.push(`pageToken=${nextPageToken}`);
                        const queryString = queryStringArr.join('&');
                        const url = `${baseUrl}?${queryString}`;

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
                        pageResults.push(...data.items);

                        if (data.pagination?.nextToken) {
                            nextPageToken = data.pagination.nextToken;
                            await fetchData(maxRetries);
                        } else {
                            nextPageToken = null;
                        }
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            return fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                try {
                    await fetchData(maxRetries);
                    resolve(pageResults);
                } catch (error) {
                    reject(error);
                }
            });
        };

        const extractResult = (data) => {
            const asinArray = [];
            data.forEach((item) => {
                let found = false;
                item.identifiers.forEach((identifierGroup) => {
                    identifierGroup.identifiers.forEach((identifier) => {
                        if (
                            identifier.identifierType.toUpperCase() === productType.toUpperCase() &&
                            productIDs.includes(identifier.identifier)
                        ) {
                            asinArray.push({
                                productId: identifier.identifier,
                                productIdType: productType.toUpperCase(),
                                asin: item.asin,
                                marketplace: marketPlace,
                                brand: item.summaries?.[0]?.brand || '-',
                                itemName: (item.summaries?.[0]?.itemName || '').replace(/\\"/g, '"'),
                                color: item.summaries?.[0]?.color || '-',
                                size: item.summaries?.[0]?.size || '-',
                                style: item.summaries?.[0]?.style || '-',
                                productTypes: item.productTypes?.[0]?.productType || '-',
                                salesRanks: item.salesRanks?.[0]?.classificationRanks?.[0]?.rank || '-',
                                salesRanks2: item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || '-',
                            });
                            found = true;
                            return;
                        }
                    });

                    if (found) return;
                });

                if (!found) {
                    asinArray.push({
                        productId: '-',
                        productIdType: productType.toUpperCase(),
                        asin: item.asin,
                        marketplace: marketPlace,
                        brand: item.summaries?.[0]?.brand || '-',
                        itemName: (item.summaries?.[0]?.itemName || '').replace(/\\"/g, '"'),
                        color: item.summaries?.[0]?.color || '-',
                        size: item.summaries?.[0]?.size || '-',
                        style: item.summaries?.[0]?.style || '-',
                        productTypes: item.productTypes?.[0]?.productType || '-',
                        salesRanks: item.salesRanks?.[0]?.classificationRanks?.[0]?.rank || '-',
                        salesRanks2: item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || '-',
                    });
                }

            });

            return asinArray;
        };

        const separateProductMatches = (productIds, extractedResults, productIdType) => {
            const matches = [];
            const noMatches = [];
            const multipleMatches = [];

            const productIdMap = new Map();

            extractedResults.forEach(result => {
                const { productId } = result;
                if (!productIdMap.has(productId)) {
                    productIdMap.set(productId, []);
                }
                productIdMap.get(productId).push(result);
            });

            productIds.forEach(id => {
                if (!productIdMap.has(id)) {
                    noMatches.push({
                        productId: id,
                        productIdType: productIdType.toUpperCase(),
                        asin: '-',
                        marketplace: '-',
                        brand: '-',
                        itemName: '-',
                        color: '-',
                        size: '-',
                        style: '-',
                        productTypes: '-',
                        salesRanks: '-',
                        salesRanks2: '-',
                    });
                } else {
                    const results = productIdMap.get(id);
                    if (results.length === 1) {
                        matches.push(results[0]);
                    } else {
                        results.forEach(result => multipleMatches.push(result));
                    }
                }
            });

            return [matches, noMatches, multipleMatches];
        };

        const productIDChunks = chunkArray(productIDs, 20);
        for (let i = 0; i < productIDChunks.length; i++) {

            const chunk = productIDChunks[i];
            const chunkResult = await listingLoaderExec(amazonApiToken, chunk);
            results.push(...chunkResult);
            await delay(800);

            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }
        const initialResult = extractResult(results);

        let consolidated = separateProductMatches(productIDs, initialResult, productType);

        const headers = [
            { header: "Product ID", key: "productId", width: 15 },
            { header: "Product ID type", key: "productIdType", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Marketplace", key: "marketplace", width: 10 },
            { header: "Brand", key: "brand", width: 10 },
            { header: "Item Name", key: "itemName", width: 25 },
            { header: "Color", key: "color", width: 15 },
            { header: "Size Types", key: "size", width: 15 },
            { header: "style", key: "style", width: 15 },
            { header: "Product Type", key: "productTypes", width: 15 },
            { header: "Sales Rank (Sub)", key: "salesRanks", width: 10 },
            { header: "Sales Rank", key: "salesRanks2", width: 10 },
        ];

        const tabNames = ['UPC Match', 'Non UPC Match', 'Multiple Matches'];

        let renderFile = await createExcelFileWithMultipleTabs(headers, consolidated, tabNames);

        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = listingLoaderInit;