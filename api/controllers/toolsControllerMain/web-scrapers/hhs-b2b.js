const { uploadFileToS3 } = require('../../middlewares/aws');
const { createExcelFile } = require('../../utils/excel-utils');
const {chunkArray} = require('../../utils/array-utils');
const { delay,randomDelay } = require('../../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../../middlewares/msc');

const hhsInit = async (req, res, next, batchId,segment) => {
    try {
        const { productIDs } = req.body;
        let result = [];
        const cookie = segment == 'hhs' ? process.env.HHS_COOKIE : process.env.HHW_COOKIE;
        const baseUrl = segment == 'hhs' ? 'https://b2bsport.hellyhansen.com/api/products/' : 'https://b2bwork.hellyhansen.com/api/products/';
        const catalog = segment == 'hhs' ? 'ASAPSPORT' : 'ASAPWW';
        const accountId = segment == 'hhs' ? '9014876' : '9062220'
        const hhsExec = async (sku, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const queryStringArr = [
                    `catalog=${catalog}`,
                    `customer=${accountId}`,
                    `dropped=false`,
                    `keyword=${sku}`,
                    'sort[type]=workbook',
                    'sort[direction]=asc',
                    'variations=true',
                    'tag_facets=true',
                    'Range=0-49',
                    'hoist_quantities=true'
                ];
                const queryString = queryStringArr.join('&');
                const url = `${baseUrl}?${queryString}`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000,3000)
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} in hhsExec`);
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

        const processProductChunk = async (chunk) => {
            return Promise.all(chunk.map(async (productId) => {
                const exec = await hhsExec(productId);
                if (exec?.results.products.length <= 0) {
                    return {
                        sku: `${productId}`,
                        colorCode: '-',
                        productName: '-',
                        upc: '-',
                        productName: '-',
                        quantity: '-'
                    };
                } else {
                    const _productId = exec.results?.products[0]?._id;
                    const productName = exec.results?.products[0]?.name;
                    const colorCode = productId.split('_')[1]?.split('-')[0] || exec.results?.variations?.find(item=>item.product_id == _productId)?.code || '-';
                    const variations = exec.results?.products[0]?.variations;
                    const itemDetails = variations.find(item => item.code == colorCode)?.stock_items?.find(item=>item.sku ==productId || item.key == productId) || '-'
                    const stockShipments = exec?.stock_shipments?.find(item=>item?.key == itemDetails?.key) || '-'; 
                    return {
                        sku: `${productId}`,
                        colorCode: colorCode || '-',
                        productName: productName || '-',
                        upc: itemDetails.upc || '-',
                        quantity: stockShipments.quantity || '-'
                    };
                }
            }));
        };

        const productChunks = chunkArray(productIDs, 5);
        for (let i = 0; i < productChunks.length; i++) {
            const chunkResults = await processProductChunk(productChunks[i]);
            result.push(...chunkResults.flat());
            const progress = Math.round((i + 1) / productChunks.length * 100);
            await updateBatchProgress(batchId, progress);

            await delay(800); 
        }
        let headers = [
            { header: "Product ID", key: "sku", width: 15 },
            { header: "Item Name", key: "productName", width: 15 },
            { header: "Color Code", key: "colorCode", width: 10 },
            { header: "UPC", key: "upc", width: 15 },
            { header: "quantity", key: "quantity", width: 10 },
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

module.exports = hhsInit;
