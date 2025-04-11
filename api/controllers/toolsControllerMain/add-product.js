const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl, getSellerCentralCookie } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const addProductInit = async (req, res, next, batchId) => {
    const { productType, productIDs, marketPlace, qualificationcheck } = req.body;
    const results = [];
    const cookies = await getSellerCentralCookie(marketPlace);
    try {
        const amazonApiToken = await generateLWAaccessToken();
        const addProductExec = async (amazonApiToken, productIDs, maxRetries = 3, delayMs = 1300) => {
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

        const checkQualificationExec = async (asin, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const url = `https://sellercentral.amazon.com/productsearch/v2/search?q=${asin}&pageSize=10`;
                const options = {
                    method: 'get',
                    headers: {
                        'content-type': 'application/json',
                        'cookie': cookies.cookie,
                        'accept-language': 'en-US,en;q=0.9'
                    }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(url, options);

                        if (!response.ok) {
                            if (response.status === 429) {
                                await delay(15000);
                            } else {
                                throw new Error(`HTTP error! for Qualification check for ${asin}, status: ${response.status}`);
                            }

                            if (retryCount > 0) {
                                await delay(delayMs);
                                return fetchData(retryCount - 1);
                            } else {
                                throw new Error(`Failed after ${maxRetries} retries`);
                            }
                        }
                        const data = await response.json();
                        resolve(data);
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
            let imageLinks = [];

            data.forEach((entry) => {
                if (Array.isArray(entry.items)) {
                    entry.items.forEach((item) => {
                        if (item.asin) {

                            let productID = item.asin;
                            if (productType !== 'asin') {
                                const identifiersArray = item.identifiers?.[0]?.identifiers;
                                productID = identifiersArray?.find(identifier => identifier.identifierType === productType.toUpperCase() && productIDs.includes(identifier.identifier))?.identifier;
                            }

                            const eanUPCArr = item.identifiers?.[0]?.identifiers.filter(identifier =>
                                identifier.identifierType === 'EAN' || identifier.identifierType === 'UPC'
                            );
                            const tempUPC = eanUPCArr?.filter(identifier => identifier.identifierType === 'UPC')?.length > 1

                                ? eanUPCArr?.filter(identifier => identifier.identifierType === 'UPC').map(identifier => identifier.identifier).join('\n')
                                : eanUPCArr?.find(identifier => identifier.identifierType === 'UPC')?.identifier || '-';

                            const tempEAN = eanUPCArr?.filter(identifier => identifier.identifierType === 'EAN')?.length > 1
                                ? eanUPCArr?.filter(identifier => identifier.identifierType === 'EAN').map(identifier => identifier.identifier).join('\n')
                                : eanUPCArr?.find(identifier => identifier.identifierType === 'EAN')?.identifier || '-';
                            imageLinks = [];
                            if (item.images && item.images.length > 0) {
                                item.images[0].images.forEach(image => {
                                    if (image.variant === "MAIN") {
                                        imageLinks.push(image.link);
                                    }
                                });
                            }

                            const imageUrl = imageLinks.join('\n') || '-';
                            const normalizedUPC = tempUPC?.replace(/^0+/, '');
                            const normalizedEAN = tempEAN?.replace(/^0+/, '');
                            asinArray.push({
                                productId: "'" + (productID || '-'),
                                asin: item.asin || '-',
                                title: (item.summaries?.[0]?.itemName || '').replace(/\\"/g, '"'),
                                upc: `'${tempUPC}`,
                                ean: `'${tempEAN}`,
                                productMatch: tempUPC.includes('\n') && tempEAN.includes('\n')
                                    ? 'Multiple UPC & EAN' : tempUPC.includes('\n')
                                        ? 'Multiple UPC'
                                        : tempEAN.includes('\n')
                                            ? 'Multiple EAN'
                                            : normalizedUPC === normalizedEAN
                                                ? 'Yes'
                                                : 'No',
                                detailPageUrl: 'https://www.amazon.com/dp/' + (item.asin || ''),
                                salesRanks: item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || '-',
                                imageUrl: imageUrl,
                                imageAvailability: imageUrl === '-' ? 'No' : 'Yes',
                                availability: 'Available',
                                productGroup: item.summaries?.[0]?.websiteDisplayGroupName || '-'
                            });
                        }
                    });
                }
            });

            return asinArray;
        };

        const extractQualificationResult = async (initialResult) => {
            let index = 0;
            for (const item of initialResult) {
                const qualificationCheckResult = await checkQualificationExec(item.asin);
                const qualificationMessages = qualificationCheckResult?.products?.[0]?.qualificationMessages || [];
                const formattedMessages = qualificationMessages.map(msg => {
                    const conditionList = msg.conditionList || "";
                    return `${conditionList} - ${msg.qualificationMessage}`;
                }).join('\n \n');
                item.qualificationDetails = formattedMessages || "-";
            
                await delay(1000);
            
                const progress = Math.round(((index + 1) / initialResult.length) * 100);
                await updateBatchProgress(batchId, progress);
            
                index++; 
            }
        };

        const updateInitialResult = (initialResult, productIDs) => {
            const existingProductIds = initialResult.map(product => product.productId.replace(/^'/, ''));
            productIDs.forEach(id => {
                if (!existingProductIds.includes(id)) {
                    initialResult.push({
                        productId: `'${id}`,
                        asin: '-',
                        title: '-',
                        upc: "'-",
                        ean: "'-",
                        productMatch: '-',
                        detailPageUrl: '-',
                        salesRanks: '-',
                        imageUrl: '-',
                        imageAvailability: '-',
                        availability: '-',
                        productGroup: '-'
                    });
                }
            });

            return initialResult;
        }

        const productIDChunks = chunkArray(productIDs, 20);

        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await addProductExec(amazonApiToken, chunk);
            results.push(...chunkResult);
            await delay(800);

            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const initialResult = updateInitialResult(extractResult(results), productIDs);
        if (qualificationcheck) {
            await extractQualificationResult(initialResult);
        }

        const headers = [
            { header: "Product ID", key: "productId", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Title", key: "title", width: 25 },
            { header: "UPC", key: "upc", width: 20 },
            { header: "EAN", key: "ean", width: 20 },
            { header: "Product IDs Match?", key: "productMatch", width: 20 },
            { header: "Detail Page URL", key: "detailPageUrl", width: 10 },
            { header: "Sales Rank", key: "salesRanks", width: 10 },
            { header: "Image URL", key: "imageUrl", width: 10 },
            { header: "Image Available?", key: "imageAvailability", width: 10 },
            { header: "Availability", key: "availability", width: 10 },
            { header: "Product Group", key: "productGroup", width: 10 },
            { header: "Qualification Details", key: "qualificationDetails", width: 30 },
        ];

        const renderFile = await createExcelFile(headers, initialResult);

        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ 'success': true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = addProductInit;
