const { generateLWAaccessToken, getMarketPlaceIDs, amzBaseUrl, getCookieByAccount } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFileForReview2 } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { useSphereProvider } = require('../middlewares/proxy-middleware');
const { chunkArray } = require('../utils/array-utils');

const amazonReviewInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace } = req.body;
    try {
        const chunks = chunkArray(productIDs, 30);
        const totalChunks = chunks.length;
        const cookie = marketPlace === "com" ? await getCookieByAccount('yara') : await getCookieByAccount('yara-ca')
        const marketplaceId = marketPlace === "com" ? getMarketPlaceIDs('US') : getMarketPlaceIDs('CA')
        let results = [];
        const amazonApiToken = await generateLWAaccessToken();

        const salesRankExec = async (amazonApiToken, asins, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `${amzBaseUrl}/catalog/2022-04-01/items`;
                const queryStringArr = [
                    `identifiers=${asins}`,
                    `identifiersType=ASIN`,
                    `marketplaceIds=${marketplaceId}`,
                    `includedData=salesRanks`,
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
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        const retData = data.items || 'n/a';
                        resolve(retData);
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

        const resultSchema = [
            {
                "brand": "span#cr-arp-byline > a"
            },
            {
                "title": "div.a-row.product-title > h1 > a"
            },
            {
                "starRating": "span[data-hook='rating-out-of-text']"
            },
            {
                "fiveStarPercent": "#histogramTable li:first-child .a-text-right span"
            },
            {
                "customerRating": "div[data-hook='total-review-count']"
            },
            {
                "reviews": "span[data-hook='review-body']"
            },
            {
                "reviewPerAsin" : "div[data-hook='cr-filter-info-review-rating-count']"    
            }
        ]

        for (let i = 0; i < totalChunks; i++) {
            const chunk = chunks[i];
            const urls = chunk.map(asin => ({ "id": asin, "url": `https://www.amazon.${marketPlace}/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_fmt?ie=UTF8&showViewpoints=1&formatType=current_format&pageNumber=1` }));
            const scrapeExec = await useSphereProvider(urls, resultSchema, cookie.cookie, marketPlace === "com" ? 'amazon-review' : 'amazon-review-ca');
            if (scrapeExec) {
                results.push(...(Array.isArray(scrapeExec) ? scrapeExec?.flat() : scrapeExec));
            } else {
                chunk.forEach(asin=>{
                    results.push({
                        id : asin, 
                        url : `https://www.amazon.${marketPlace}/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_fmt?ie=UTF8&showViewpoints=1&formatType=current_format&pageNumber=1`, 
                        brand : "-", 
                        title : "-", 
                        starRating : "-", 
                        fiveStarPercent : "-", 
                        customerRating : "-", 
                        reviewPerAsin : "-", 
                        reviews : ['-'], 
                    })
                })
            }

            const progress = Math.round(((i + 1) / totalChunks) * 100);
            await updateBatchProgress(batchId, progress);
            await delay(1000);
        }

        await (async () => {
            const chunkResult = chunkArray(results, 20);
            for (let i = 0; i < chunkResult.length; i++) {
                const chunk = chunkResult[i].map((item) => item.id);
                const salesRank = await salesRankExec(amazonApiToken, chunk);

                salesRank.forEach(rank => {
                    const resultItem = results.find(item => item.id === rank.asin);
                    if (resultItem) {
                        resultItem.ranks = rank.salesRanks[0]?.displayGroupRanks[0]?.rank || '-';
                    }
                });

                await delay(1000);
            }

        })();

        const headers = [
            { header: 'ASIN', key: 'id', width: 15 },
            { header: 'Url', key: 'url', width: 15 },
            { header: 'Brand', key: 'brand', width: 25 },
            { header: 'Title', key: 'title', width: 10 },
            { header: 'Star Rating', key: 'starRating', width: 10 },
            { header: 'Five Star Percent', key: 'fiveStarPercent', width: 10 },
            { header: 'Customer Rating', key: 'customerRating', width: 10 },
            { header: 'Review Per Asin', key: 'reviewPerAsin', width: 10 },
            { header: 'Sales Rank', key: 'ranks', width: 10 },
            { header: 'Review 1', key: 'reviews.review1', width: 10 },
            { header: 'Review 2', key: 'reviews.review2', width: 10 },
            { header: 'Review 3', key: 'reviews.review3', width: 10 },
            { header: 'Review 4', key: 'reviews.review4', width: 10 },
            { header: 'Review 5', key: 'reviews.review5', width: 10 },
            { header: 'Review 6', key: 'reviews.review6', width: 10 },
            { header: 'Review 7', key: 'reviews.review7', width: 10 },
            { header: 'Review 8', key: 'reviews.review8', width: 10 },
            { header: 'Review 9', key: 'reviews.review9', width: 10 },
            { header: 'Review 10', key: 'reviews.review10', width: 10 },
        ];
        let renderFile = await createExcelFileForReview2(headers, results);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);

        await updateBatchStatus(batchId, 3);
    } catch (error) {
        console.error('Error:', error.message);
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
    }

};

module.exports = amazonReviewInit;
