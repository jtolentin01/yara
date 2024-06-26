const { generateLWAaccessToken, getMarketPlaceIDs,amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { extractUniqueValues, chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const {updateBatchStatus, updateBatchProgress} = require('../middlewares/msc');

const asinCheckerLiteInit = async (req, res, next, batchId) => {
    const { productType, productIDs } = req.body;
    try {
        const amazonApiToken = await generateLWAaccessToken();
        const asinCheckerLiteExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1000) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `identifiers=${identifiers}`,
                    `identifiersType=${productType}`,
                    `marketplaceIds=${getMarketPlaceIDs('US')}`,
                    `includedData=identifiers,attributes,summaries,relationships,productTypes,salesRanks`,
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
                            const parentAsin = (item.relationships?.[0]?.relationships?.[0]?.parentAsins?.[0]) || 'n/a';
                            asinArray.push({
                                asin: item.asin,
                                link: `https://sellercentral.amazon.com/abis/listing/syh?asin=${item.asin}&ref_=xx_catadd_dnav_xx#offer`,
                                title: (item.summaries?.[0]?.itemName || '').replace(/\\"/g, '"'),
                                brand: item.summaries?.[0]?.brand || 'n/a',
                                gender: (item.attributes?.target_gender?.[0]?.value || item.attributes?.department?.[0]?.value || 'n/a'),
                                color: item.summaries?.[0]?.color || 'n/a',
                                size: item.summaries?.[0]?.size || 'n/a',
                                productTypes: item.productTypes?.[0]?.productType || 'n/a',
                                salesRanks: item.salesRanks?.[0]?.classificationRanks?.[0]?.rank || 'n/a',
                                salesRanks2: item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || 'n/a',
                                parentasin: parentAsin,
                                standalone: (parentAsin === 'n/a') ? 'Yes' : 'No'
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        const results = [];
        const parentResultArr = [];
        const productIDChunks = chunkArray(productIDs, 20);

        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await asinCheckerLiteExec(amazonApiToken, chunk);
            results.push(...chunkResult);
            await delay(800);

            // Update progress after processing each chunk
            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const initialResult = extractResult(results);
        let uniqueParentAsins = extractUniqueValues(initialResult, 'parentasin');

        const chunkUniqueParentAsins = chunkArray(uniqueParentAsins, 20);

        for (let i = 0; i < chunkUniqueParentAsins.length; i++) {
            const chunk = chunkUniqueParentAsins[i];
            const chunkResult = await asinCheckerLiteExec(amazonApiToken, chunk);
            parentResultArr.push(...chunkResult);
            await delay(800);

            // Update progress after processing each parent chunk
            const progress = Math.round((i + 1) / chunkUniqueParentAsins.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const parentResult = extractResult(parentResultArr);

        const mergedResults = initialResult.map(item => {
            if (item.parentasin && item.standalone === 'No') {
                const parentItem = parentResult.find(parent => parent.asin === item.parentasin);
                if (parentItem) {
                    return {
                        ...item,
                        parentTitle: parentItem.title,
                        parentBrand: parentItem.brand,
                        parentGender: parentItem.gender,
                        parentProductType: parentItem.productTypes
                    };
                }
            }
            return item;
        });

        let headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Link", key: "link", width: 15 },
            { header: "Title", key: "title", width: 25 },
            { header: "Brand", key: "brand", width: 10 },
            { header: "Gender", key: "gender", width: 10 },
            { header: "Color", key: "color", width: 10 },
            { header: "Size", key: "size", width: 10 },
            { header: "Product Types", key: "productTypes", width: 10 },
            { header: "Sales Rank (Sub)", key: "salesRanks", width: 10 },
            { header: "Sales Rank", key: "salesRanks2", width: 10 },
            { header: "Parent ASIN", key: "parentasin", width: 10 },
            { header: "Standalone", key: "standalone", width: 10 },
            { header: "Parent Title", key: "parentTitle", width: 10 },
            { header: "Parent Brand", key: "parentBrand", width: 10 },
            { header: "Parent Gender", key: "parentGender", width: 10 },
            { header: "Parent Product Type", key: "parentProductType", width: 10 },
        ];

        let renderFile = await createExcelFile(headers, mergedResults);

        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
        res.status(200).json(mergedResults);

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = asinCheckerLiteInit;
