const { uploadFileToS3 } = require('../middlewares/aws');
const { getCookieByAccount } = require('../middlewares/amz-api');
const { createExcelFileForReview } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { useSphereProvider } = require('../middlewares/proxy-middleware');
const { chunkArray } = require('../utils/array-utils');
const { proxyScrapingInit } = require('../utils/scraping-utils');

const amazonPageInit = async (req, res, next, batchId) => {
    const { productIDs } = req.body;
    const chunks = chunkArray(productIDs, 35);
    const totalChunks = chunks.length;
    const cookie = await getCookieByAccount('oe');
    let results = [];

    try {
        const resultSchema = [
            {
                title: "#productTitle"
            },
            {
                count: {
                    alias: "imageCount",
                    selector: "#altImages img"
                }
            },
            {
                list: {
                    alias: "bullets",
                    selector: "#productFactsDesktopExpander .a-expander-content ul.a-unordered-list > li",
                    separator: ""
                }
            },
            {
                check: {
                    alias: "pageNotFound",
                    selector: "#d (alt)"
                }
            },
            {
                image: "#imgTagWrapperId > img (data-old-hires)"
            },
            {
                category: "#wayfinding-breadcrumbs_feature_div"
            },
            {
                brand: "#bylineInfo"
            },
            {
                description: "#productDescription"
            },
            {
                list: {
                    alias: "additionalCategories1",
                    selector: "ul.detail-bullet-list > li > span",
                    separator: ""
                }
            },
            {
                list: {
                    alias: "additionalCategories2",
                    selector: "#productDetails_detailBullets_sections1 > tbody > tr > td > span",
                    separator: ""
                }
            },
            {
                prices: "#corePrice_desktop .a-price-range .a-offscreen"
            },
            {
                list: {
                    alias: "ebcDescription",
                    selector: "div.aplus-v2 p",
                    separator: ", "
                }
            },
            {
                "list": {
                    "alias": "aPlusHeader",
                    "selector": "#aplus h2",
                    "separator": ""
                }
            }
        ]

        for (let i = 0; i < totalChunks; i++) {
            const chunk = chunks[i];

            if (chunk.length < 10) {
                const chunkUrls = chunk.map(asin => ({ id: asin, url: `https://www.amazon.com/dp/${asin}?th=1&psc=1` }));
                const chunkResult = await proxyScrapingInit(chunkUrls, resultSchema);
                if (chunkResult?.length > 0) {
                    results.push(...chunkResult);
                }
            } else {

                const secondHalf = chunk.slice(-25);
                const firstHalf = chunk.slice(0, chunk.length - 25);

                const firstHalfUrls = firstHalf.map(asin => ({ id: asin, url: `https://www.amazon.com/dp/${asin}?th=1&psc=1` }));
                const secondHalfUrls = secondHalf.map(asin => ({ id: asin, url: `https://www.amazon.com/dp/${asin}?th=1&psc=1` }));

                const requests = [];
                if (firstHalfUrls.length > 0) {
                    requests.push(useSphereProvider(firstHalfUrls, resultSchema, cookie.cookie, 'amazon-dp'));
                }
                if (secondHalfUrls.length > 0) {
                    requests.push(proxyScrapingInit(secondHalfUrls, resultSchema));
                }

                const resultsData = await Promise.all(requests);
                resultsData.forEach(result => {
                    if (result?.length > 0) {
                        results.push(...result);
                    }
                });
            }

            chunk.forEach(asin => {
                if (!results.some(r => r.id === asin)) {
                    results.push({
                        id: asin,
                        url: `https://www.amazon.com/dp/${asin}`,
                        brand: "-",
                        title: "-",
                        description: "-",
                        bullets: "-",
                        pageNotFound: "-",
                        image: "-",
                        imageCount: "-",
                        category: "-",
                        prices: "-",
                        additionalCategories1: "-",
                        additionalCategories2: "-",
                        ebcDescription: "-",
                        brandStory: "-",
                        aPlusFromManufacturer: "-",
                        aPlusFromSeller: "-"
                    });
                }
            });

            const progress = Math.round(((i + 1) / totalChunks) * 100);
            await updateBatchProgress(batchId, progress);
            await delay(1000);
        }

        results.forEach((item) => {
            item.brand = item?.brand ? item.brand.replace(/Visit the | Store/g, '') : '-';
            item.imageCount = item?.imageCount > 1 ? item?.imageCount - 1 : item.imageCount || 0;
            item.bullets = Array.isArray(item?.bullets) && item.bullets.length > 0
                ? `<ul>${item.bullets.map(bullet => `<li>${bullet}</li>`).join('')}</ul>`
                : '-';
            item.bestSellersRank = Array.isArray(item?.additionalCategories1)
                ? item.additionalCategories1
                    .find(category => /Best Sellers Rank/i.test(category))
                    ?.replace(/Best Sellers Rank:/gi, '')
                    .trim() || "-"
                : "-";
            // item.brandStory = item?.aPlusHeader?.includes("From the brand") ? "Yes" : "No" || '-';
            // item.aPlusFromManufacturer = item?.aPlusHeader?.includes("From the manufacturer") ? "Yes" : "No" || '-';
            // item.aPlusFromSeller = item?.aPlusHeader?.includes("Product Description") ? "Yes" : "No" || '-';
            item.brandStory = item?.aPlusHeader?.some(header => header.includes("From the brand")) ? "Yes" : "No";
            item.aPlusFromManufacturer = item?.aPlusHeader?.some(header => header.includes("From the manufacturer")) ? "Yes" : "No";
            item.aPlusFromSeller = item?.aPlusHeader?.some(header => header.includes("Product Description")) ? "Yes" : "No";

            item.method = item.method || 'Sphere';
        });

        const headers = [
            { header: 'Asin', key: 'id', width: 15 },
            { header: 'Brand', key: 'brand', width: 15 },
            { header: 'Title', key: 'title', width: 25 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Prices', key: 'prices', width: 15 },
            { header: 'Image', key: 'image', width: 15 },
            { header: 'ImageCount', key: 'imageCount', width: 15 },
            { header: 'Description', key: 'description', width: 15 },
            { header: 'EBC Description', key: 'ebcDesc', width: 15 },
            { header: 'HTML Bullets', key: 'bullets', width: 15 },
            { header: 'Best Sellers Rank', key: 'bestSellersRank', width: 15 },
            { header: 'Brand Story', key: 'brandStory', width: 15 },
            { header: 'A+ From Manufacturer', key: 'aPlusFromManufacturer', width: 15 },
            { header: 'A+ From Seller', key: 'aPlusFromSeller', width: 15 },
            { header: 'Empty Detail Page', key: 'pageNotFound', width: 15 },
            { header: 'Method', key: 'method', width: 15 }
        ];
        const renderFile = await createExcelFileForReview(headers, results);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);
    } catch (error) {
        console.error('Error:', error);
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, {
            error: error.message,
            stackTrace: error.stack
        });
    }

}

module.exports = amazonPageInit;