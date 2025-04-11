const { generateLWAaccessToken, getMarketPlaceIDs, getSellerCentralCookie, amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay, getProperties, convertListingIssue } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo} = require('../middlewares/msc');
const { chunkArray } = require('../utils/array-utils');

const editPageInit = async (req, res, next, batchId) => {
    try {
        const { marketPlace, skuAsins, account } = req.body;
        const cookies = await getSellerCentralCookie(marketPlace);
        const amazonApiToken = await generateLWAaccessToken();
        const sellerId = 'A7ULJO7NAWM0L';
        const result = [];
        const filteredSkuAsins = skuAsins.filter(skuAsin => skuAsin.trim() !== '');
        const mappedSkuAsins = filteredSkuAsins.map(skuAsin => {
            const [sku, asin] = skuAsin.split(/\s{2,}|\t/); 
            return { sku, asin: asin };
        });        
        const skuAsinAll = chunkArray(mappedSkuAsins, 20);

        const getCatalogItem = async (amazonApiToken, asinList, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                    `identifiersType=ASIN`,
                    `pageSize=20`,
                    `includedData=summaries,attributes`,
                    `identifiers=${asinList}`
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
                        const data = await response.json();

                        if (!response.ok) {
                            console.error(`Error details: ${JSON.stringify(data)}`); 
                            throw new Error(`HTTP error! status: ${response.status} - ${data.errors[0]?.message || 'Unknown error'}`);
                        }

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

        const getListingIstem = async (amazonApiToken, sku, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}`;
                const queryStringArr = [
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                    `includedData=summaries,attributes`,
                ];
                const queryString = queryStringArr.join('&');
                const url = `${baseUrl}?${queryString}`;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };
                const randomDelay = (minMs, maxMs) => {
                    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                    return new Promise(resolve => setTimeout(resolve, delayTime));
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500, 2000);
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

        const fetchBuyBoxEligible = async (sku, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/skucentralarbiter/pricing?msku=${sku}`;
                const options = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookies.cookie
                    }
                };
                const randomDelay = (minMs, maxMs) => {
                    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                    return new Promise(resolve => setTimeout(resolve, delayTime));
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500, 2000);
                        const response = await fetch(baseUrl, options);
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

        const extractRes1 = (data) => {
            const asinArray = [];

            data.forEach((entry) => {
                if (Array.isArray(entry.items)) {
                    entry.items.forEach((item) => {
                        let amzBullets = item.attributes?.bullet_point || ['n/a'];
                        let amzBulletsEach = amzBullets != 'n/a' ? amzBullets = amzBullets.map(item => item.value) : ['n/a']

                        asinArray.push({
                            asin: item.asin,
                            amzItemName: item.summaries[0]?.itemName || '-',
                            amzBrandName: item.attributes?.brand?.[0]?.value || '-',
                            amzProdDesc: item.attributes?.product_description?.[0]?.value || '-',
                            amzBullets: amzBulletsEach.join('\n'),
                        });
                    });
                }
            });

            return { asinArray };
        };

        const extractRes2 = (data) => {
            const asinArray = [];
            let oeBullets = data[0].attributes?.bullet_point || ['n/a']  || '-';
            let oeBulletsEach = oeBullets != 'n/a' ? oeBullets = oeBullets.map(item => item.value) : ['n/a']  || '-';
            asinArray.push({
                asin: data[0].summaries?.[0]?.asin || '-',
                oeItemName: data[0].summaries?.[0]?.itemName || '-',
                oeBrandName: data[0].attributes?.brand?.[0]?.value || '-',
                oeProdDesc: data[0].attributes?.product_description?.[0]?.value || '-',
                oeBullets: oeBulletsEach.join('\n') || '-',
                oeKeywords: data[0].attributes?.generic_keyword?.[0]?.value || '-',
                amzKeywords: data[0].attributes?.generic_keyword?.[0]?.value || '-',
            });
            return { asinArray };
        };

        for (let i = 0; i < skuAsinAll.length; i++) {
            const chunk = skuAsinAll[i];

            const asinString = chunk.map(item => item.asin).join(',');

            try {
                const catalogData = await getCatalogItem(amazonApiToken, asinString);
                const extractedCatalog = extractRes1(catalogData);
                const catalogMap = new Map(extractedCatalog.asinArray.map(item => [item.asin, item]));
                const skuList = chunk.map(item => item.sku);
                const asinList = chunk.map(item => item.asin);

                for (let j = 0; j < skuList.length; j += 10) {
                    const skuBatch = skuList.slice(j, j + 10);
                    const asinBatch = asinList.slice(j, j + 10);
                    const listingItemRequests = skuBatch.map(sku => getListingIstem(amazonApiToken, sku, sellerId));

                    try {
                        const listingItemData = await Promise.all(listingItemRequests);
                        const buyBoxBadge = skuBatch.map((sku) => fetchBuyBoxEligible(sku));
                        const buyBoxBadgeData = await Promise.all(buyBoxBadge);

                        const buyBoxBadgeMap = new Map();
                        const buyBoxBadgeMapSku = new Map();

                        buyBoxBadgeData.forEach((item, index) => {
                            try {
                                if (Array.isArray(item) && item[0]?.result) {
                                    const parsedResult = JSON.parse(item[0].result).GetPricingData?.buyBoxBadge?.label || '-';

                                    buyBoxBadgeMap.set(asinBatch[index], parsedResult);
                                    buyBoxBadgeMapSku.set(asinBatch[index], skuBatch[index]);
                                } else {
                                    console.warn(`Item ${index} has an unexpected structure or is missing 'result'.`);
                                }
                            } catch (error) {
                                console.error(`Error parsing JSON for item ${index}:`, error);
                            }
                        });

                        listingItemData.forEach((listingData) => {
                            const extractedListing = extractRes2(listingData);

                            extractedListing.asinArray.forEach((listing) => {
                                const catalogEntry = catalogMap.get(listing.asin);

                                if (catalogEntry) {
                                    const mergedEntry = {
                                        sku: buyBoxBadgeMapSku.get(listing.asin) || '-',
                                        account: account === 'oe' ? 'outdoor_equipped' : '-',
                                        asin: listing.asin || '-',
                                        amzItemName: catalogEntry.amzItemName || '-',
                                        amzBrandName: catalogEntry.amzBrandName || '-',
                                        amzProdDesc: catalogEntry.amzProdDesc || '-',
                                        amzBullets: catalogEntry.amzBullets || '-',
                                        oeItemName: listing.oeItemName || '-',
                                        oeBrandName: listing.oeBrandName || '-',
                                        oeProdDesc: listing.oeProdDesc || '-',
                                        oeBullets: listing.oeBullets || '-',
                                        oeKeywords: listing.oeKeywords || '-',
                                        amzKeywords: listing.amzKeywords || '-',
                                        featuredOfferEligible: buyBoxBadgeMap.get(listing.asin) || '-',
                                    };

                                    result.push(mergedEntry);
                                }
                            });
                        });

                        const progress = Math.round((j + 10) / chunk.length * 100);
                        await updateBatchProgress(batchId, progress);

                    } catch (err) {
                        console.error(`Error processing SKU batch [${j}-${j + 10}]:`, err.message);
                    }
                }

            } catch (error) {
                console.error(`Error processing chunk ${i}:`, error.message);
            }
        }
        await updateBatchProgress(batchId, 100);
        let headers = [
            { header: "SKU", key: "sku", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Account Code", key: "account", width: 25 },
            { header: "OE Item Name", key: "oeItemName", width: 10 },
            { header: "Amazon Item Name", key: "amzItemName", width: 15 },
            { header: "OE Brand Name", key: "oeBrandName", width: 15 },
            { header: "Amazon Brand Name", key: "amzBrandName", width: 15 },
            { header: "OE Product Descriptions", key: "oeProdDesc", width: 15 },
            { header: "Amazon Product Descriptions", key: "amzProdDesc", width: 15 },
            { header: "OE Bullet Points", key: "oeBullets", width: 15 },
            { header: "Amazon Bullet Points", key: "amzBullets", width: 15 },
            { header: "OE Generic Keywords", key: "oeKeywords", width: 15 },
            { header: "Amazon Generic Keywords", key: "amzKeywords", width: 15 },
            { header: "Featured Offer Eligible", key: "featuredOfferEligible", width: 15 },
        ];
        let renderFile = await createExcelFile(headers, result);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);

        await updateBatchStatus(batchId, 3);

        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, {error:error.message});
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = editPageInit;
