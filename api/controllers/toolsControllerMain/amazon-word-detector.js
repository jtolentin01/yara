const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFileExec } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { getCookieByAccount } = require('../middlewares/amz-api');
const { useSphereProvider } = require('../middlewares/proxy-middleware');
const { chunkArray } = require('../utils/array-utils');
const { getlocationsAndPhrases } = require('../utils/amazon-word-detector');

const amazonWordInit = async (req, res, next, batchId) => {
    const { productIDs, words } = req.body;
    const chunks = chunkArray(productIDs, 30);
    const totalChunks = chunks.length;
    const cookie = await getCookieByAccount('oe');
    let resultsArr = [];
    let rawResults = [];

    try {
        const resultSchema = [
            {
                "title": "#productTitle"
            },
            {
                "list": {
                    "alias": "bullets",
                    "selector": "#productFactsDesktopExpander li",
                    "separator": ""
                }
            },
            {
                "description": "#productDescription"
            },
            {
                "ebcDesc": "div.aplus-v2 p"
            },
            {
                "check": {
                    "alias": "pageNotFound",
                    "selector": "#d (alt)"
                }
            }
        ]

        for (let i = 0; i < totalChunks; i++) {
            const chunk = chunks[i];
            const urls = chunk.map(asin => ({ "id": asin, "url": `https://www.amazon.com/dp/${asin}` }));
            const scrapeExec = await useSphereProvider(urls, resultSchema, cookie.cookie, 'amazon-dp');
            if (scrapeExec) {
                rawResults.push(...(Array.isArray(scrapeExec) ? scrapeExec?.flat() : scrapeExec));
            } else {
                chunk.forEach(asin => {
                    rawResults.push({
                        id: asin,
                        url: `https://www.amazon.com/dp/${asin}`,
                        title: "-",
                        bullets: "-",
                        description: "-",
                        ebcDesc: "-",
                    })
                })
            }

            const progress = Math.round(((i + 1) / totalChunks) * 100);
            await updateBatchProgress(batchId, progress);
            await delay(1000);

        }
        for (const item of rawResults) {
            const detectWordsResult = await getlocationsAndPhrases({
                ...item,
                bullets: Array.isArray(item?.bullets) ? item.bullets.join(". ") : "-"
            }, words);

            if (detectWordsResult.length > 0) {
                detectWordsResult.forEach((res) => {
                    resultsArr.push({
                        asin: item.id,
                        ...res,
                    });
                });
            } else {
                resultsArr.push({
                    asin: item.id,
                    location: "-",
                    keyword: "-",
                    phrase: "-",
                });
            }
        }

        // rawResults.forEach((item) => {
        //     item.bullets = item.bullets ? trim(item.bullets.join("\n")) : "-";
        // })

        const headers = [
            [
                { label: "ASIN", key: "asin", width: 15 },
                { label: "LOCATION", key: "location", width: 15 },
                { label: "KEYWORD", key: "keyword", width: 15 },
                { label: "PHRASE", key: "phrase", width: 10 },
                { label: "Details", key: "pageNotFound", width: 10 },
            ],
            [],
            [
                { label: "ASIN", key: "id", width: 15 },
                { label: "TITLE", key: "title", width: 15 },
                { label: "DESCRIPTION", key: "description", width: 15 },
                { label: "BULLETS", key: "bullets", width: 10 },
                { label: "EBC", key: "ebcDesc", width: 10 },
                { label: "DETAILS", key: "pageNotFound", width: 10 },
            ],

        ];
        const tabNames = ['Result', 'Keywords', 'Raw Data'];
        const consolidated = [resultsArr, words, rawResults]
        let renderFile = await createExcelFileExec(headers, consolidated, tabNames);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchStatus(batchId, 3);

    } catch (error) {
        console.error('Error:', error);
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
    }

};

module.exports = amazonWordInit;
