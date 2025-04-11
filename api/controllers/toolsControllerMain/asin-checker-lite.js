const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl, getSkuByAsin, generateClientLWAaccessToken } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { extractUniqueValues, chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const asinCheckerLiteInit = async (req, res, next, batchId) => {
    const { productType, productIDs, marketPlace, includeSku, account } = req.body;
    let accountName;
    switch (account) {
        case 'oe':
            accountName = 'Outdoor Equipped'
            break;

        case 'evenflo':
            accountName = 'Evenflo'
            break;

        case 'wonderfold':
            accountName = 'Wonderfold'
            break;

        case 'fieldsheer':
            accountName = 'Fieldsheer'
            break;

        case 'booyah':
            accountName = 'Booyah'
            break;

        case 'sebago':
            accountName = 'Sebago'
            break;

        default:
            accountName = '-'
            break;
    }

    try {
        const amazonApiToken = await generateLWAaccessToken();
        const asinCheckerLiteExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const identifiers = productIDs.join(',');
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `identifiers=${identifiers}`,
                    `identifiersType=${productType}`,
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
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
                                link: `https://sellercentral.amazon.com/abis/listing/syh?asin=${item.asin}&ref_=xx_catadd_dnav_xx#offer`,
                                title: (item.summaries?.[0]?.itemName || '').replace(/\\"/g, '"'),
                                brand: item.summaries?.[0]?.brand || '-',
                                itemTypeKeyword: item.attributes?.item_type_keyword?.[0]?.value || '-',
                                targetGender: item.attributes?.target_gender?.[0]?.value || '-',
                                manufacturer: item.attributes?.manufacturer?.[0]?.value || '-',
                                footwearGender: item.attributes?.footwear_size?.[0]?.gender || '-',
                                gender: (item.attributes?.department?.[0]?.value || item.attributes?.target_gender?.[0]?.value || '-'),
                                color: item.summaries?.[0]?.color || '-',
                                size: item.summaries?.[0]?.size || '-',
                                productTypes: item.productTypes?.[0]?.productType || '-',
                                salesRanks: item.salesRanks?.[0]?.classificationRanks?.[0]?.rank || '-',
                                salesRanks2: item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || '-',
                                parentasin: parentAsin,
                                standalone: (parentAsin === '-') ? 'Yes' : 'No'
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        const updateInitialResult = (initialResult, productIDs) => {
            const existingProductIds = initialResult.map(product => product.asin);
            productIDs.forEach(id => {
                if (!existingProductIds.includes(id)) {
                    initialResult.push({
                        asin: `${id}`,
                        link: '-',
                        title: '-',
                        brand: "-",
                        itemTypeKeyword: "-",
                        targetGender: '-',
                        manufacturer: '-',
                        footwearGender: '-',
                        gender: '-',
                        color: '-',
                        size: '-',
                        productTypes: '-',
                        salesRanks: '-',
                        salesRanks2: '-',
                        standalone: '-'
                    });
                }
            });

            return initialResult;
        }

        const extractSku = (data) => {
            const skuArray = [];
            data.forEach((entry) => {
                if (Array.isArray(entry.payload)) {
                    entry.payload.forEach((item) => {
                        if (item.ASIN && item.Product.Offers && item.Product.Offers.length > 0) {
                            let skus = item.Product.Offers.map(offer => offer.SellerSKU).join('\n') || '-';
                            skuArray.push({
                                asin: item.ASIN,
                                sku: skus
                            });
                        }
                    });
                }
            });

            return skuArray;
        };

        const initialCheckWeight = includeSku ? 0.8 : 0.9;
        const parentAsinCheckWeight = 0.1;
        const skuCheckWeight = includeSku ? 0.1 : 0;

        const results = [];
        const parentResultArr = [];
        const skuResultArr = [];
        const productIDChunks = chunkArray(productIDs, 20);

        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await asinCheckerLiteExec(amazonApiToken, chunk);
            results.push(...chunkResult);
            await delay(800);

            const progress = Math.round(((i + 1) / productIDChunks.length) * initialCheckWeight * 100);
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

            const progress = Math.round((initialCheckWeight * 100) + ((i + 1) / chunkUniqueParentAsins.length) * parentAsinCheckWeight * 100);
            await updateBatchProgress(batchId, progress);
        }

        if (includeSku) {
            const clientToken = account === 'oe' ? amazonApiToken : await generateClientLWAaccessToken(account);
            for (let i = 0; i < productIDChunks.length; i++) {
                const chunk = productIDChunks[i];
                const chunkResult = await getSkuByAsin(clientToken, chunk, marketPlace);
                skuResultArr.push(...chunkResult);
                await delay(800);

                const progress = Math.round((initialCheckWeight + parentAsinCheckWeight) * 100 + ((i + 1) / productIDChunks.length) * skuCheckWeight * 100);
                await updateBatchProgress(batchId, progress);

            }
        }

        const skuResults = includeSku ? extractSku(skuResultArr) : [];
        const parentResult = extractResult(parentResultArr);

        const mergedResults = initialResult.map(item => {
            const parentItem = parentResult.find(parent => parent.asin === item.parentasin);
            const skuItem = includeSku ? skuResults.find(sku => sku.asin === item.asin) : null;

            if ((item.parentasin && item.standalone === 'No') || (item.standalone === 'Yes' && includeSku)) {
                return {
                    ...item,
                    sku: skuItem ? skuItem.sku : '-',
                    account: accountName || '-',
                    parentTitle: parentItem?.title || '-',
                    parentBrand: parentItem?.brand || '-',
                    parentGender: parentItem?.gender || '-',
                    parentProductType: parentItem?.productTypes || '-'
                };
            }

            return item;
        });

        let headers = [
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Link", key: "link", width: 15 },
            { header: "Title", key: "title", width: 25 },
            { header: "Brand", key: "brand", width: 10 },
            { header: "Manufacturer", key: "manufacturer", width: 10 },
            { header: "Gender / Department", key: "gender", width: 10 },
            { header: "Target Gender", key: "targetGender", width: 10 },
            { header: "Footwear Gender", key: "footwearGender", width: 10 },
            { header: "Color", key: "color", width: 10 },
            { header: "Size", key: "size", width: 10 },
            { header: "Item Type Keyword", key: "itemTypeKeyword", width: 20 },
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

        if (includeSku) {
            headers.splice(14, 0, { header: "Seller SKU", key: "sku", width: 15 });
            headers.splice(15, 0, { header: "Seller Account", key: "account", width: 15 });
        }

        const consolidatedResult = updateInitialResult(mergedResults,productIDs);

        let renderFile = await createExcelFile(headers, consolidatedResult);
        await updateBatchProgress(batchId, 100);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
        res.status(200).json(mergedResults);

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = asinCheckerLiteInit;
