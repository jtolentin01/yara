const { getSellerCentralCookie, getCookieProviderInit } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { randomDelay, delay, getProperties,convertListingIssue } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo, updateBatchTotalItems } = require('../middlewares/msc');

const listingIssuesInit = async (req, res, next, batchId) => {
    try {
        const {marketPlace} = req.body;
        const oeCookie = await getSellerCentralCookie(marketPlace);
        // const oeCookie = await getCookieProviderInit(`oe`,marketPlace);
        const result = [];
        const dataArray = [];

        const listingIssuesExec = async (filter, offset, cookies, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/fixyourproducts/completeSkus?status=ISSUE_INACTIVE&pageSize=250&offset=${offset}&sortType=DATE&sortOrder=DESCENDING&searchTerm=null&searchType=null&filter=%5B%7B%22type%22%3A%22AGGREGATED_LISTING_STATUS%22%2C%22values%22%3A%5B%22${filter}%22%5D%7D%5D`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies }
                };

                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500,1000);
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
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

        const getTotalItems = async (issueFilter, cookies, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/fixyourproducts/completeSkus?status=ISSUE_INACTIVE&pageSize=250&offset=0&sortType=DATE&sortOrder=DESCENDING&searchTerm=null&searchType=null&filter=%5B%7B%22type%22%3A%22AGGREGATED_LISTING_STATUS%22%2C%22values%22%3A%5B%22${issueFilter}%22%5D%7D%5D`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies }
                };

                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500,1000);
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        resolve(data.totalItems);
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

        const filterList = getProperties(req.body);

        for (const filter of filterList) {
            const totalItems = await getTotalItems(filter, oeCookie.cookie);
            const count = Math.ceil(totalItems / 50) || 0;
            if (totalItems === 0) {
                dataArray.push({
                    sku: '-',
                    asin: '-',
                    title: '-',
                    brandName: '-',
                    listingIssue: filter
                });
            }

            for (let i = 0; i < count; i++) {
                const offset = i * 50;
                try {
                    const data = await listingIssuesExec(filter, offset, oeCookie.cookie);

                    if (data && data.items) {
                        for (let j = 0; j < data.items.length; j++) {
                            const item = data.items[j] || {};
                            const sku = item.sku || '-';
                            const asin = item.product?.catalogProduct?.asin || '-';
                            const title = item.product?.catalogProduct?.title || '-';
                            const brandName = item.product?.catalogProduct?.brandName || '-';

                            dataArray.push({
                                sku,
                                asin,
                                title,
                                brandName,
                                listingIssue: filter
                            });
                        }
                    } else {
                        dataArray.push({
                            sku: '-',
                            asin: '-',
                            title: '-',
                            brandName: '-',
                            listingIssue: filter
                        });
                    }

                    const progress = Math.round(((i + 1) / count) * 100);
                    await updateBatchProgress(batchId, progress);

                } catch (error) {
                    console.error(`Failed to fetch data for filter ${filter} at offset ${offset}:`, error);
                }
            }
            let dataResult = convertListingIssue(dataArray);
            await updateBatchTotalItems(batchId, dataResult.length);
            await updateBatchProgress(batchId, 100);
            let headers = [
                { header: "SKU", key: "sku", width: 15 },
                { header: "ASIN", key: "asin", width: 15 },
                { header: "Brand", key: "brandName", width: 25 },
                { header: "Title", key: "title", width: 10 },
                { header: "Listing Issue", key: "listingIssue", width: 10 },
            ];

            let renderFile = await createExcelFile(headers, dataResult);
            await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
            
            await updateBatchStatus(batchId, 3);
        }

        res.status(200).json({ result, extractedData: dataArray });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, {error:error.message});
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = listingIssuesInit;
