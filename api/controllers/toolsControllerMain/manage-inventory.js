const { getSellerCentralCookie, getCookieForB2b } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const jsonPayload = require('./manage.inventory-payload.json');
const { JSDOM } = require('jsdom');

const manageInventoryInit = async (req, res, next, batchId) => {
    try {
        const { marketPlace, productIDs, brand } = req.body;
        const cookies = brand ? await getCookieForB2b(`vendor-central-${brand}`) : await getSellerCentralCookie(marketPlace)
        const result = [];

        const getCsrfToken = async (maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/myinventory/inventory?fulfilledBy=all&page=1&pageSize=25&sort=date_created_desc&status=all&ref_=xx_invmgr_dnav_xx`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for Getting Csrf token`);
                        }
                        const csrfToken = response?.headers?.get('anti-csrftoken-a2z') || null
                        resolve(csrfToken);
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
        const getCsrfToken1P = async (maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://vendorcentral.amazon.com/hz/vendor/members/products/mycatalog?ref_=vc_xx_subNav`;
                const options = {
                    method: 'get',
                    headers: { 'Cookie': cookies.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for Getting Csrf token for 2P`);
                        }
                        const html = await response.text();
                        const dom = new JSDOM(html);
                        const document = dom.window.document;
                        resolve(document.querySelector('input[name="csrfToken"]').value);
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
        const token = brand ? await getCsrfToken1P() : await getCsrfToken();

        const manageInventoryExec = async (searchTerm, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/myinventory/gql`;
                jsonPayload.variables.searchTerm.term = searchTerm;
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept-language': 'en-US,en;q=0.9',
                        'anti-csrftoken-a2z': token,
                        'Cookie': cookies.cookie
                    },
                    body: JSON.stringify(jsonPayload)
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for in executing Manage Inventory exec`);
                        }
                        const data = await response.json();
                        resolve(data?.data?.listings);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            return await fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                await fetchData(maxRetries);
            });
        };

        const manageInventoryExec2P = async (searchTerm, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://vendorcentral.amazon.com/hz/vendor/members/products/mycatalog/ajax/query`;
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'accept-language': 'en-US,en;q=0.9',
                        'Cookie': cookies.cookie,
                    },
                    body: new URLSearchParams({
                        csrfToken: token,
                        searchTerms: searchTerm,
                    }).toString(),
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for in executing Manage Inventory exec for 2P`);
                        }
                        const data = await response.text();
                        resolve(data);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            return await fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                await fetchData(maxRetries);
            });
        };

        const extractProductIDs = (html, key) => {
            const dom = new JSDOM(html);
            const document = dom.window.document;
        
            const getDefinitionValue = (row, term) => {
                const dt = Array.from(row.querySelectorAll("dt")).find(el => el.textContent.trim() === term);
                return dt ? dt.nextElementSibling?.textContent.trim() : null;
            };
        
            const rows = document.querySelectorAll("table.mycat-table tr.mycat-row-white");
        
            const tableData = Array.from(rows)
                .map(row => {
                    const productCheckbox = row.querySelector("input[type='checkbox'][name='productId']");
                    const imageUrl = row.querySelector(".mycat-image-td img")?.src || null;
        
                    const productCell = row.querySelector("td:nth-child(3)");
                    const productLink = productCell?.querySelector("a")?.href || null;
                    const productName = productCell?.querySelector("a")?.textContent.trim() || null;
        
                    const asin = getDefinitionValue(row, "ASIN");
                    const ean = getDefinitionValue(row, "EAN");
                    const upc = getDefinitionValue(row, "UPC");
                    const eanUpc = ean || upc || null; // Simplified ternary logic
                    const vendorCode = row.querySelector("td:nth-child(5)")?.textContent.trim() || null;
                    const lastModified = row.querySelector("td:nth-child(6)")?.textContent.trim() || null;
                    const availability = row.querySelector("td:nth-child(8)")?.textContent.trim() || null;
        
                    return {
                        productId: productCheckbox?.value || null,
                        imageUrl,
                        productLink,
                        productName,
                        asin,
                        eanUpc,
                        vendorCode,
                        lastModified,
                        availability
                    };
                })
                .filter(product => Object.values(product).some(value => value !== null))
                .map(product => ({ ...product, key }));
        
            return tableData.length === 0 ? [{ key }] : tableData;
        };

        const extractResult = () => {
            const arrRes = [];

            const mapFields = (item, listing = {}) => ({
                searchTerm: item?.searchTerm || '-',
                count: item?.count || '-',
                asin: listing?.id?.asin || '-',
                sku: listing?.id?.sku || '-',
                title: listing?.details?.title || '-',
                image: listing?.details?.imageUrl || '-',
                salesRank: listing?.details?.salesRank?.rank || '-',
                availableStock: listing?.inventory?.available || '-',
                reservedStock: listing?.inventory?.reserved || '-',
                inbound: listing?.inventory?.inbound || '-',
                unfulfillable: listing?.inventory?.unfulfillable || '-',
                fulfillmentChannel: listing?.offers?.[0]?.fulfillmentChannel || '-',
                minAllowedPrice: listing?.offers?.[0]?.minAllowedPrice?.price?.amount || '-',
                maxAllowedPrice: listing?.offers?.[0]?.maxAllowedPrice?.price?.amount || '-',
                price: listing?.offers?.[0]?.price?.price?.amount || '-',
                buyBoxPrice: listing?.offers?.[0]?.buyBoxPrice?.price?.amount || '-',
                businessPrice: listing?.offers?.[0]?.businessPrice?.price?.amount || '-',
                salePrice: listing?.offers?.[0]?.salePrice?.price?.amount || '-',
                sales: listing?.performance?.sales?.amount || '-',
                itemCondition: listing?.offers?.[0]?.condition?.condition || '-',
                pageViews: listing?.performance?.pageViews || '-',
                unitSold: listing?.performance?.unitsSold || '-',
                status: listing?.state || '-',
                productType: listing?.id?.productType || '-',
                createdDate: listing?.created || '-',
                lastChanged: listing?.lastChanged || '-',
            });

            result.forEach(item => {
                if (item.listings && item.listings.length > 0) {
                    item.listings.forEach(listing => arrRes.push(mapFields(item, listing)));
                } else {
                    arrRes.push(mapFields(item));
                }
            });

            return arrRes;
        };

        for (let i = 0; i < productIDs.length; i++) {
            const keyResult = brand ? await manageInventoryExec2P(productIDs[i]) : await manageInventoryExec(productIDs[i]);
            if (!brand) keyResult.searchTerm = productIDs[i];
            brand ? result.push(...extractProductIDs(keyResult, productIDs[i])) : result.push(keyResult);
            await delay(800);
            const progress = Math.round(((i + 1) / productIDs.length) * 100);
            await updateBatchProgress(batchId, progress);
        }
        const extractedResult = brand ? result : extractResult()
        const headersFor2P = [
            { header: "Keyword", key: "key", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "EAN/UPC", key: "eanUpc", width: 15 },
            { header: "PRODUCT ID", key: "productId", width: 15 },
            { header: "VENDOR CODE", key: "vendorCode", width: 15 },
            { header: "PRODUCT NAME", key: "productName", width: 20 },
            { header: "PRODUCT LINK", key: "productLink", width: 15 },
            { header: "IMAGE URL", key: "imageUrl", width: 15 },
            { header: "AVAILABILITY", key: "availability", width: 15 },
        ]

        const headers = [
            { header: "Keyword", key: "searchTerm", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "SKU", key: "sku", width: 15 },
            { header: "Title", key: "title", width: 20 },
            { header: "Image", key: "image", width: 15 },
            { header: "Sales Rank", key: "salesRank", width: 10 },
            { header: "Available Stock", key: "availableStock", width: 10 },
            { header: "Reserved Stock", key: "reservedStock", width: 10 },
            { header: "Inbound", key: "inbound", width: 10 },
            { header: "Unfulfillable", key: "unfulfillable", width: 10 },
            { header: "Fulfillment", key: "fulfillmentChannel", width: 10 },
            { header: "Min Allowed Price", key: "minAllowedPrice", width: 10 },
            { header: "Max Allowed Price", key: "maxAllowedPrice", width: 10 },
            { header: "Price", key: "price", width: 10 },
            { header: "Buybox Price", key: "buyBoxPrice", width: 10 },
            { header: "Business Price", key: "businessPrice", width: 10 },
            { header: "Sale Price", key: "salePrice", width: 10 },
            { header: "Unit Sold", key: "unitSold", width: 10 },
            { header: "Sales", key: "sales", width: 10 },
            { header: "Page Views", key: "pageViews", width: 10 },
            { header: "Item Condition", key: "itemCondition", width: 10 },
            { header: "Status", key: "status", width: 15 },
            { header: "Product Type", key: "productType", width: 15 },
            { header: "Created Date", key: "createdDate", width: 15 },
            { header: "Updated Date", key: "lastChanged", width: 15 },
        ];

        let renderFile = await createExcelFile(brand ? headersFor2P : headers, extractedResult);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);

        await updateBatchProgress(batchId, 100);
        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = manageInventoryInit;
