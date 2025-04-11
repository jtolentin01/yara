const { generateLWAaccessToken, generateClientLWAaccessToken, getMarketPlaceIDs, amzBaseUrl } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay, formatDate, isPastDate } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { chunkArray } = require('../utils/array-utils');

const editPagePricingInit = async (req, res, next, batchId) => {
    try {
        const { marketPlace, skuAsins, account } = req.body;
        const result = [];
        const chunkedSku = chunkArray(skuAsins, 10);
        
        const amazonApiToken = account == 'oe' ? await generateLWAaccessToken() : await generateClientLWAaccessToken(account);
        const sellerIdList = [
            {'oe':'A7ULJO7NAWM0L'},
            {'sebago':'A3GXNFH5W09YGF'},
            {'evenflo':'A3ULD558QQYTPY'},
            {'wonderfold':'A2SO2RZZPSOTQS'},
            {'fieldsheer':'A1M6HXUBPULN09'},
            {'booyah':'A3P0FQ6N33S1JA'},
            {'safetyjogger':'A3L25XHYTHLESH'},
            {'armsreach':'A2VH870KO4861Y'},
            {'fila':'ACXU159EUJXQA'},
            {'magformers':'A73XZRTFU0UP7'},
            {'Hootenannygames':'A1FZ4NPQBVTNY'},
            {'plantoys':'A3IBL4W3YFVRAZ'},
            {'wohali':'A34K7KWRB00STX'},
            {'safetyshirtz':'A1NHOXELIN7C47'},
            {'tru-spec':'A2UBH5IPBBAGKX'},
            {'revolutionrace':'A3P9OFNN7J6PGN'},
        ];
        const sellerId = sellerIdList.find(item => item[account])?.[account] || '';
        const getListingItems = async (amazonApiToken, sku, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}`;
                const queryStringArr = [
                    `marketplaceIds=${getMarketPlaceIDs(marketPlace)}`,
                    `includedData=attributes,offers,issues`,
                ];
                const queryString = queryStringArr.join('&');
                const url = `${baseUrl}?${queryString}`;
                const options = {
                    method: 'get',
                    headers: { 'x-amz-access-token': amazonApiToken }
                };
                const randomDelay = (minMs, maxMs) => {
                    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                    return new Promise(resolve => setTimeout(resolve, delayTime));
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(500, 2000);
                        const response = await fetch(url, options);
                        // if (!response.ok) {
                        //     throw new Error(`HTTP error! status: ${response.status}`);
                        // }
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

        const extractRes = (data, sku) => {
            const retArr = [];
            const issueArr = [];
            let salePrice, saleStartDate, salesEndDate
            if (data[0].issues && data[0].issues.length > 0) {
                data[0].issues.forEach(issue => issueArr.push(issue.message))
            }
            if (isPastDate(formatDate(data[0]?.attributes?.purchasable_offer?.[0]?.discounted_price?.[0]?.schedule?.[0]?.end_at))) {
                salePrice = '-',
                    saleStartDate = '-',
                    salesEndDate = '-'
            }
            else {
                salePrice = data[0]?.attributes?.purchasable_offer?.[0]?.discounted_price?.[0]?.schedule?.[0]?.value_with_tax || '-'
                saleStartDate = formatDate(data[0]?.attributes?.purchasable_offer?.[0]?.discounted_price?.[0]?.schedule?.[0]?.start_at) || '-'
                salesEndDate = formatDate(data[0]?.attributes?.purchasable_offer?.[0]?.discounted_price?.[0]?.schedule?.[0]?.end_at) || '-'
            }
            retArr.push({
                sku: data[0].sku || sku,
                salePrice: salePrice || '-',
                saleStartDate: saleStartDate || '-',
                salesEndDate: salesEndDate || '-',
                listPrice: data[0]?.attributes?.list_price?.[0]?.value || '-',
                businessPrice: data[0]?.offers?.find(offer => offer.offerType === "B2B")?.price?.amount || '-',
                minPrice: data[0]?.attributes?.purchasable_offer?.[0]?.minimum_seller_allowed_price?.[0]?.schedule?.[0]?.value_with_tax || '-',
                maxPrice: data[0]?.attributes?.purchasable_offer?.[0]?.maximum_seller_allowed_price?.[0]?.schedule?.[0]?.value_with_tax || '-',
                issues: issueArr.join('\n') || '-'
            });

            return { retArr };
        };

        for (let i = 0; i < chunkedSku.length; i++) {
            const skuList = chunkedSku[i];
            const listingItemRequests = skuList.map(sku => getListingItems(amazonApiToken, sku, sellerId));
            const listingItemData = await Promise.all(listingItemRequests);

            listingItemData.forEach((item, index) => {
                const extracted = extractRes(item, skuList[index]);
                result.push(extracted.retArr[0]);
            });

            const progress = Math.round((i + 1) / chunkedSku.length * 100);
            await updateBatchProgress(batchId, progress);
            await delay(1000);
        }

        await updateBatchProgress(batchId, 100);
        let headers = [
            { header: "SKU", key: "sku", width: 15 },
            { header: "Sale Price", key: "salePrice", width: 15 },
            { header: "Sale Start Date", key: "saleStartDate", width: 25 },
            { header: "Sale End Date", key: "salesEndDate", width: 10 },
            { header: "List Price", key: "listPrice", width: 15 },
            { header: "Business Price", key: "businessPrice", width: 15 },
            { header: "Minimum Price", key: "minPrice", width: 15 },
            { header: "Maximum Price", key: "maxPrice", width: 15 },
            { header: "Issues", key: "issues", width: 20 },
        ];
        let renderFile = await createExcelFile(headers, result);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ success: true });

    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = editPagePricingInit;
