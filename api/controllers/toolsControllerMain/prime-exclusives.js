const { getCookieByAccount } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo,updateBatchTotalItems } = require('../middlewares/msc');

const primeExclusivesInit = async (req, res, next, batchId) => {
    try {
        const { productIDs, account } = req.body;
        let results = [];
        let cookie;

        switch (account) {
            case 'oe':
                cookie = await getCookieByAccount(account);
                break
            case 'evenflo':
                cookie = await getCookieByAccount(account);
                break
            case 'wonderfold':
                cookie = await getCookieByAccount(account);
                break
            case 'dsg':
                cookie = await getCookieByAccount(account);
                break
            default:
                cookie = ''
                break;
        }

        const primeExclusivesParentExec = async (promotionId, pageSize, pageNum, pageMetadata, maxRetries = 3, delayMs = 3000) => {
            return new Promise(async (resolve, reject) => {
                let baseUrl = 'https://sellercentral.amazon.com/prime-discounts/ajax/fetch/submitted/'
                let queryStringArr = [`pageSize=${pageSize}`, `pageNum=${pageNum}`, `pageMetadata=${pageMetadata}`]
                let queryString = queryStringArr.join('&')
                let url = `${baseUrl}${promotionId}?${queryString}`
                let options = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookie.cookie,
                    },
                }
                const randomDelay = (minMs, maxMs) => {
                    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                    return new Promise(resolve => setTimeout(resolve, delayTime));
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(100, 600);
                        const response = await fetch(url, options);

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        let data;
                        try {
                            data = await response.json();
                        } catch (jsonError) {
                            throw new Error('Failed to parse JSON. Response might be HTML or another format.');
                        }

                        resolve(data);
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

        const primeExclusivesChildExec = async (promotionId, parentId, maxRetries = 3, delayMs = 3000) => {
            return new Promise(async (resolve, reject) => {
                let url = `https://sellercentral.amazon.com/prime-discounts/ajax/fetch/children/${promotionId}/${parentId}`
                let options = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookie.cookie,
                    },
                }
                const randomDelay = (minMs, maxMs) => {
                    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                    return new Promise(resolve => setTimeout(resolve, delayTime));
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500, 3000);
                        const response = await fetch(url, options);

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        let data;
                        try {
                            data = await response.json();
                        } catch (jsonError) {
                            throw new Error('Failed to parse JSON. Response might be HTML or another format.');
                        }
                        const res = {
                            promotionId:promotionId,
                            parentId:parentId,
                            result:data
                        }

                        resolve(res);
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

        const processPromotion = async (id) => {
            let pageMetadata = '';
            let data = await primeExclusivesParentExec(id, 100, 1, pageMetadata);
            const promoName = data.promotion.promoName;
            const totalPages = data.paginator.totalPages;
            const totalItems = data.paginator.totalItems;
            pageMetadata = data.paginator.pageMetadata;
            const results = [];
        
            await updateBatchTotalItems(batchId, totalItems);
        
            let processedItems = 0;
        
            for (let j = 1; j <= totalPages; j++) {
                data = await primeExclusivesParentExec(id, 100, j, pageMetadata);
                pageMetadata = data.paginator.pageMetadata;
                const parentRows = data.table.rows;
        
                parentRows.forEach(item => {
                    results.push({
                        promoName: promoName,
                        promotionId: id,
                        parentId: item.id,
                        variation: 'Parent',
                        sku: item.sku,
                        asin: item.asin,
                        yourPrice: item.yourPrice <= 0 ? '-' : item.yourPrice,
                        salePrice: item.salePrice <= 0 ? '-' : item.salePrice,
                        primeDiscount: item.discountValue + ' ' + item.discountType,
                        minimumPrice: item.minimumPrice,
                        discountedPrimePrice: item.benefitPrice <= 0 ? '-' : item.benefitPrice,
                        status: item.status == 'منتهي الصلاحية' ? 'Expired' : item.status,
                        statusTooltip: removeAngleBracketContent(item.statusTooltip),
                    });
                });
        
                processedItems += parentRows.length;
        
                const progress = Math.round((processedItems / totalItems) * 90);
                await updateBatchProgress(batchId, progress);
            }
        
            return results;
        };
        

        const processPromotionChild = async (parentResult) => {
            const groupedData = parentResult.reduce((acc, { parentId, promotionId }) => {
                if (!acc[promotionId]) {
                    acc[promotionId] = [];
                }
                acc[promotionId].push(parentId);
                return acc;
            }, {});
        
            const results = [];
            for (const promotionId in groupedData) {
                const parentIds = groupedData[promotionId];
                const chunkedParentIds = [];
                for (let i = 0; i < parentIds.length; i += 10) {
                    chunkedParentIds.push(parentIds.slice(i, i + 10));
                }
        
                for (const chunk of chunkedParentIds) {
                    const promises = chunk.map(parentId => primeExclusivesChildExec(promotionId, parentId));
                    const chunkResults = await Promise.all(promises);
        
                    chunkResults.forEach(data => {
                        const childRows = data.result.children;
        
                        childRows.forEach(item => {
                            results.push({
                                promoName: promoName || '-',
                                promotionId: data.promotionId,
                                parentId: data.parentId,
                                variation: 'Child',
                                sku: item.sku || '-',
                                asin: item.asin || '-',
                                yourPrice: item.yourPrice <= 0 ? '-' : item.yourPrice || '-',
                                salePrice: item.salePrice <= 0 ? '-' : item.salePrice || '-',
                                primeDiscount: item.discountValue + ' ' + item.discountType || '-',
                                minimumPrice: item.minimumPrice,
                                discountedPrimePrice: item.benefitPrice <= 0 ? '-' : item.benefitPrice || '-',
                                status: item.status == 'منتهي الصلاحية' ? 'Expired' : item.status,
                                statusTooltip: removeAngleBracketContent(item.statusTooltip) || '-',
                                
                            });
                        });
                    });
                }
            }
            return results;
        };

        const mergeResults = (parentRes, childRes) => {
            if (Array.isArray(childRes) && childRes.length > 0) {
                return [...parentRes, ...childRes];
            }
            return parentRes;
        };
        
        const removeAngleBracketContent = (inputString) => {
            const regex = /<[^>]*>/g
            const resultString = inputString.replace(regex, '')
            return resultString
        }

        for (let i = 0; i < productIDs.length; i++) {
            const parentRes = await processPromotion(productIDs[i]);
            const childRes = await processPromotionChild(parentRes);
            const mergedResults = mergeResults(parentRes, childRes);
    
            results = [...results, ...mergedResults];
        }
        let headers = [
            { header: "Promo Name", key: "promoName", width: 15 },
            { header: "Promotion", key: "promotionId", width: 15 },
            { header: "Variation", key: "variation", width: 15 },
            { header: "SKU", key: "sku", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "Your Price", key: "yourPrice", width: 15 },
            { header: "Sale Price", key: "salePrice", width: 15 },
            { header: "Prime Discount", key: "primeDiscount", width: 15 },
            { header: "Minimum Price", key: "minimumPrice", width: 15 },
            { header: "Discounted Prime Price", key: "discountedPrimePrice", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Status Tooltip", key: "parstatusTooltipentasin", width: 15 },
        ];
        let renderFile = await createExcelFile(headers, results);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);

        await updateBatchProgress(batchId, 100);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = primeExclusivesInit;
