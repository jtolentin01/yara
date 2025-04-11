const { generateLWAaccessToken, generateClientLWAaccessToken, amzBaseUrl, getSkuByAsin } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { chunkArray } = require('../utils/array-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const skuExtractorInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace, account } = req.body;
    const productIDChunks = chunkArray(productIDs, 20);
    const result = [];

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
        const extractSku = (data) => {
            const skuArray = [];
            data.forEach((entry) => {
                if (Array.isArray(entry.payload)) {
                    entry.payload.forEach((item) => {
                        if (item.ASIN && item.Product.Offers && item.Product.Offers.length > 0) {
                            let skus = item.Product.Offers.map(offer => offer.SellerSKU).join('\n') || '-';
                            let itemCondition = item.Product.Offers.map(offer => offer.ItemCondition).join('\n') || '-';
                            let fullfillment = item.Product.Offers.map(offer => offer.FulfillmentChannel).join('\n') || '-';
                            skuArray.push({
                                asin: item.ASIN,
                                sku: skus,
                                account: accountName,
                                itemCondition: itemCondition,
                                fullfillment: fullfillment,

                            });
                        }
                    });
                }
            });

            return skuArray;
        };

        const separateProductMatches = (productIds, skuResults) => {
            const result = [];

            const skuMap = new Map();
            skuResults.forEach(sku => {
                skuMap.set(sku.asin, sku);
            });

            productIds.forEach(id => {
                if (skuMap.has(id)) {
                    const match = skuMap.get(id);
                    result.push({
                        productId: id,
                        asin: match.asin,
                        sku: match.sku,
                        account: match.account,
                        itemCondition: match.itemCondition,
                        fullfillment: match.fullfillment,
                    });
                } else {
                    result.push({
                        productId: id,
                        asin: '-',
                        sku: '-',
                        account: accountName,
                        itemCondition: '-',
                        fullfillment: '-',
                    });
                }
            });

            return result;
        };

        const clientToken = account === 'oe' ? amazonApiToken : await generateClientLWAaccessToken(account);
        for (let i = 0; i < productIDChunks.length; i++) {
            const chunk = productIDChunks[i];
            const chunkResult = await getSkuByAsin(clientToken, chunk, marketPlace);
            result.push(...chunkResult);
            await delay(800);

            const progress = Math.round((i + 1) / productIDChunks.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const skuResults = extractSku(result) || [];
        const parsedResult = separateProductMatches(productIDs, skuResults);
        let headers = [
            { header: "Product ID", key: "productId", width: 15 },
            { header: "Seller Account", key: "account", width: 20 },
            { header: "SKU", key: "sku", width: 15 },
            { header: "Item Condition", key: "itemCondition", width: 15 },
            { header: "Fullfillment Channel", key: "fullfillment", width: 20 },
        ];

        let renderFile = await createExcelFile(headers, parsedResult);
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
};

module.exports = skuExtractorInit;
