const { uploadFileToS3 } = require('../../middlewares/aws');
const { createExcelFile } = require('../../utils/excel-utils');
const { chunkArray } = require('../../utils/array-utils');
const { delay, randomDelay } = require('../../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../../middlewares/msc');

const seikoPubInit = async (req, res, next, batchId) => {
    try {
        const { productIDs } = req.body;
        let result = [];

        const seikoExec = async (sku, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://seikousa.com/collections/seiko5sports/products/${sku}.js`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json' }
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000, 3000);
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            resolve({});
                        }
                        else{
                            const data = await response.json();
                            resolve(data);
                        }
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

        const processProductChunk = async (chunk) => {
            return Promise.all(chunk.map(async (productId) => {
                const exec = await seikoExec(productId);
                if (!exec?.id) {
                    return {
                        id: '-',
                        sku: `${productId}`,
                        requiresShipping: '-',
                        requiresSellingPlan: '-',
                        taxable: '-',
                        available: '-',
                        price: '-',
                    };
                } else {
                    let variantArr = [];
                    exec.variants.forEach(element => {
                        variantArr.push({
                            id: element.id || '-',
                            sku: `${productId}`,
                            requiresShipping: `${element.requires_shipping}`.toUpperCase() || '-',
                            requiresSellingPlan: `${element.requires_selling_plan}`.toUpperCase() || '-',
                            taxable: `${element.taxable}`.toUpperCase() || '-',
                            available: `${element.available}`.toUpperCase() || '-',
                            price: (element.price / 100) || '-',
                        })
                    });
                    return variantArr;
                }
            }));
        };

        const productChunks = chunkArray(productIDs, 5);
        for (let i = 0; i < productChunks.length; i++) {
            const chunkResults = await processProductChunk(productChunks[i]);

            result.push(...chunkResults.flat());

            const progress = Math.round(((i + 1) * 5) / productIDs.length * 100);
            await updateBatchProgress(batchId, progress);

            await delay(800);
        }

        let headers = [
            { header: "ID", key: "id", width: 10 },
            { header: "SKU", key: "sku", width: 10 },
            { header: "Requires Shipping", key: "requiresShipping", width: 10 },
            { header: "Requires Selling Plan", key: "requiresSellingPlan", width: 10 },
            { header: "Taxable", key: "taxable", width: 15 },
            { header: "Available", key: "available", width: 15 },
            { header: "Price", key: "price", width: 10 },
        ];

        let renderFile = await createExcelFile(headers, result);
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

module.exports = seikoPubInit;
