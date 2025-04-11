const { generateLWAaccessToken, getSellerCentralCookie } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const cheerio = require('cheerio')

const amzProdIssuesInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace } = req.body;

    try {
        let amazonApiToken = await generateLWAaccessToken();
        const oeCookie = await getSellerCentralCookie(marketPlace);
        let result = [];

        //<----- [ MISSING DIMENSIONS + NOT_IN_PRODUCT_CATALOG ]
        const chkCatalogBySku = async (sku, maxRetries = 3, delayMs = 1300) => {
            const baseUrl = `https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items?identifiersType=SKU&marketplaceIds=ATVPDKIKX0DER&includedData=dimensions&sellerId=A7ULJO7NAWM0L&identifiers=${sku}`;
            const options = {
                method: 'GET',
                headers: { 'x-amz-access-token': amazonApiToken }
            };

            for (let retry = maxRetries; retry >= 0; retry--) {
                try {
                    const response = await fetch(baseUrl, options);
                    if (response.ok) return await response.json();

                    if (response.status === 400) return [];
                    if (response.status === 429) await delay(15000);
                    if (response.status === 403) {
                        amazonApiToken = await generateLWAaccessToken();
                        options.headers['x-amz-access-token'] = amazonApiToken;
                    }
                } catch (error) {
                    if (retry === 0) throw error;
                }
                await delay(delayMs);
            }
            throw new Error(`Failed after ${maxRetries} retries`);
        };

        //<----- [ ITEM STRANDED ]
        const chkItemStranded = async (sku, maxRetries = 3, delayMs = 1300) => {
            const baseUrl = `https://sellercentral.amazon.com/inventoryplanning/stranded-inventory/refresh/ref=xx_xx_srch_xx`;
            const options = {
                method: 'POST',
                headers: { 'cookie': oeCookie.cookie, 'content-type': 'application/json' },
                body: JSON.stringify({ "action": "SEARCH_CHANGED", "pageNumber": 1, "recordsPerPage": null, "sortedColumnId": "date-stranded-field", "sortOrder": "ASCENDING", "searchText": `${sku}`, "tableId": "stranded", "filters": [], "clientState": {} })
            };

            for (let retry = maxRetries; retry >= 0; retry--) {
                try {
                    const response = await fetch(baseUrl, options);
                    if (response.ok) {
                        const htmlBody = await response.text();
                        const $ = cheerio.load(htmlBody);
                        const validate = (text) => (text ? text.trim() : '');
                        const recordCount = validate($('#recordCount').text());
                        return recordCount > 0 ? 'TRUE' : 'FALSE';
                    }

                    if (response.status === 400) return [];
                    if (response.status === 429) await delay(15000);
                    if (response.status === 403) {
                        amazonApiToken = await generateLWAaccessToken();
                        options.headers['x-amz-access-token'] = amazonApiToken;
                    }
                } catch (error) {
                    if (retry === 0) throw error;
                }
                await delay(delayMs);
            }
            throw new Error(`Failed after ${maxRetries} retries`);
        };

        //<----- [ LTSF RESTRICTION ]
        const chkLtsfRestriction = async (itemDetails, maxRetries = 3, delayMs = 1300) => {
            const baseUrl = `https://sellercentral.amazon.com/fba/inbound/skuconfig/batch-box-configurations?marketplaceId=ATVPDKIKX0DER`;
            const options = {
                method: 'POST',
                headers: { 'cookie': oeCookie.cookie, 'content-type': 'application/json' },
                body: JSON.stringify({
                    "itemList": [
                        {
                            "asin": `${itemDetails.asin}`,
                            "fnsku": `${itemDetails.fnsku}`,
                            "msku": `${itemDetails.msku}`
                        }
                    ]
                }
                )
            };

            for (let retry = maxRetries; retry >= 0; retry--) {
                try {
                    const response = await fetch(baseUrl, options);
                    if (response.ok) return await response.json();

                    if (response.status === 400) return [];
                    if (response.status === 429) await delay(15000);
                    if (response.status === 403) {
                        amazonApiToken = await generateLWAaccessToken();
                        options.headers['x-amz-access-token'] = amazonApiToken;
                    }
                } catch (error) {
                    if (retry === 0) throw error;
                }
                await delay(delayMs);
            }
            throw new Error(`Failed after ${maxRetries} retries`);
        };

        //<----- [ CHECK PRODUCT DETAILS ]
        const chkProductDetails = async (sku, maxRetries = 3, delayMs = 1300) => {
            const baseUrl = `https://sellercentral.amazon.com/fba/i2i/proxyService/afnItems?marketplaceId=ATVPDKIKX0DER&includeScaEligibility=true`;
            const options = {
                method: 'POST',
                headers: { 'cookie': oeCookie.cookie, 'content-type': 'application/json' },
                body: JSON.stringify({ "pageSize": 25, "pageOffst": 1, "msku": `${sku}`, "mskuList": [], "marketplaceId": "ATVPDKIKX0DER" })
            };

            for (let retry = maxRetries; retry >= 0; retry--) {
                try {
                    const response = await fetch(baseUrl, options);
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            fnsku: data.items[0]?.fnsku,
                            msku: data.items[0]?.msku,
                            asin: data.items[0]?.asin,
                        }
                    }

                    if (response.status === 400) return [];
                    if (response.status === 429) await delay(15000);
                    if (response.status === 403) {
                        amazonApiToken = await generateLWAaccessToken();
                        options.headers['x-amz-access-token'] = amazonApiToken;
                    }
                } catch (error) {
                    if (retry === 0) throw error;
                }
                await delay(delayMs);
            }
            throw new Error(`Failed after ${maxRetries} retries`);
        };

        for (let i = 0; i < productIDs.length; i++) {
            const productDetails = await chkProductDetails(productIDs[i]);
            const catalogItemResult = await chkCatalogBySku(productIDs[i]);
            const itemStrandedResult = await chkItemStranded(productIDs[i]);
            const ltsfResult = await chkLtsfRestriction(productDetails);

            result.push({
                sku: productIDs[i],
                notInCatalog: catalogItemResult?.response?.numberOfResults === 0 ? 'TRUE' : 'FALSE',
                catalog: catalogItemResult?.items[0]?.dimensions[0].length === 0 ? 'TRUE' : 'FALSE',
                stranded: itemStrandedResult,
                ltsf: ltsfResult?.mSkuToConfigurationMappings[0]?.configurationList[0]?.inboundProblems[0]?.explainStringId || 'FALSE',

            });
            await delay(800);
            const progress = Math.round((i + 1) / productIDs.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const headers = [
            { header: "SKU", key: "sku", width: 15 },
            { header: "IS_NOT_IN_CATALOG", key: "notInCatalog", width: 15 },
            { header: "IS_STRANDED", key: "stranded", width: 15 },
            { header: "IS_MISSING_DIMENSIONS", key: "catalog", width: 15 },
            { header: "IS_LTSF", key: "ltsf", width: 20 },
        ];

        let renderFile = await createExcelFile(headers, result);
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

module.exports = amzProdIssuesInit;
