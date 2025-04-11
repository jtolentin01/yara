const { getCookieForB2b } = require('../../middlewares/amz-api');
const { uploadFileToS3 } = require('../../middlewares/aws');
const { createExcelFile } = require('../../utils/excel-utils');
const { chunkArray } = require('../../utils/array-utils');
const { delay, randomDelay } = require('../../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../../middlewares/msc');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

const silverJeansInit = async (req, res, next, batchId,brand) => {
    const { productIDs } = req.body;
    const chunks = chunkArray(productIDs, 4);
    const resultArr = [];
    try {

        const cookie = brand === 'silver' ? await getCookieForB2b('silver-jeans') : await getCookieForB2b('jag-jeans')
        const subDomain = brand === 'silver' ? 'silverjeansco' : 'jagjeans';
        if (cookie.cookie.length < 10) throw new Error('Cannot process the request: Invalid Cookie');
        
        const silverJeansExec = async (style, maxRetries = 3, delayMs = 1500) => {
            return new Promise((resolve, reject) => {
                const url = `https://${subDomain}.threadvine.com/s/style/${style}`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookie.cookie },
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000, 2000)
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} on sauconyExec`);
                        }
                        const htmlData = await response.text();
                        resolve(htmlData);
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
        }

        const parseAvailabilities = (data) => {
            const results = [];

            for (const [key, value] of Object.entries(data.availabilities)) {
                const [width, size] = key.split('##');
                const quantity = value.displayAts;
                results.push({ width, size, quantity });
            }

            return results;
        };

        const mergeData = (arr1, arr2, styleId, styleNo, productTitle, cost, retail, color, deliveryDate) => {
            const upcMap = new Map();

            arr2.forEach(row => {
                const [width, ...upcs] = row;
                upcMap.set(width, upcs);
            });

            const merged = arr1.map(item => {
                const { width, size, quantity } = item;
                const upcs = upcMap.get(width);
                const upcIndex = parseInt(size) - 22;
                const upc = upcs && upcIndex >= 0 && upcIndex < upcs.length ? upcs[upcIndex] : 'N/A';
                return { styleId, styleNo, productTitle, cost, retail, color, deliveryDate, width, size, quantity, upc };
            });

            return merged;
        };


        const getStyleAvailability = async (styleNo, styleId, maxRetries = 3, delayMs = 1500) => {
            return new Promise((resolve, reject) => {
                const url = `https://${subDomain}.threadvine.com/s/singlePageOrder/getStyleAvailability.xhr`;
                const formData = new URLSearchParams();
                formData.append('orderId', `0`);
                formData.append('startDate', '04-16-2030');
                formData.append('styleId', `${styleId}`);
                formData.append('productNo', `${styleNo}`);
                formData.append('cancelDate', '05-15-2030');
                formData.append('customerId', '389219');
                formData.append('fromStyleOrderForm', 'true');
                formData.append('location', '');

                const options = {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Cookie': cookie.cookie,
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    body: formData.toString()
                };
                const fetchData = async (retryCount) => {
                    try {
                        await randomDelay(1000, 2000)
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error status: ${response.status} on sauconyExec`);
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
        }

        const getPageDetails = async (htmlBody, styleId) => {
            const $ = cheerio.load(htmlBody);
            const dom = new JSDOM(htmlBody);
            const document = dom.window.document;
            const validate = (text) => (text ? text.trim() : '-');

            const productTitle = validate($('#style-title > span').text()) || '-';
            const cost = document.querySelector('div#base_price')?.textContent?.replace(/\s+/g, ' ').trim() || '-';
            const retail = document.querySelector('div#retail_price > span.name-value')?.textContent?.replace(/\s+/g, ' ').trim() || '-';
            const styleNo = validate($('#style-productNo .desc-value').text()) || '-';
            const color = validate($('#color-name > h4').text()) || '-';
            const deliveryDate = validate($('#availability-grid > tbody > tr.header > th:nth-child(3)').text()) || '-';

            const upcTableRow = document.querySelectorAll('#size-data-view tbody tr') || '-';
            const upcs = Array.from(upcTableRow).map(row =>
                Array.from(row.querySelectorAll('th, td')).map(cell => cell?.textContent?.trim())
            );
            const availablityData = await getStyleAvailability(styleNo, styleId);
            const parsedData = parseAvailabilities(availablityData);
            const result = mergeData(parsedData, upcs, styleId, styleNo, productTitle, cost, retail, color, deliveryDate);

            return result;
        };
        
        for (let i = 0; i < chunks.length; i++) {
            const scrapePromises = chunks[i].map((ids) => silverJeansExec(ids));
            const results = await Promise.allSettled(scrapePromises);
        
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const styleId = chunks[i][j];
        
                if (result.status === 'fulfilled' && result.value) {
                    const details = await getPageDetails(result.value, styleId);
                    resultArr.push(...details);
                } else {
                    resultArr.push({
                        styleId: styleId,
                        styleNo: '-',
                        productTitle: '-',
                        cost: '-',
                        retail: '-',
                        color: '-',
                        deliveryDate: '-',
                        width: '-',
                        size: '-',
                        quantity: '-',
                        upc: '-',
                    });
                }
            }
            const progress = Math.round(((i + 1) / chunks.length) * 100);
            await updateBatchProgress(batchId, progress);
            await delay(1000);
        }

        const headers = [
            { header: 'Style ID', key: 'styleId', width: 15 },
            { header: 'Style No.', key: 'styleNo', width: 15 },
            { header: 'Product Title', key: 'productTitle', width: 20 },
            { header: 'Cost', key: 'cost', width: 15 },
            { header: 'Retail', key: 'retail', width: 15 },
            { header: 'Color', key: 'color', width: 15 },
            { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
            { header: 'Width', key: 'width', width: 15 },
            { header: 'Size', key: 'size', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'UPC', key: 'upc', width: 15 },
        ];

        let renderFile = await createExcelFile(headers, resultArr);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);

        await updateBatchProgress(batchId, 100);
        res.status(200).json({ success: true });
    } catch (error) {
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, { error: error.message });
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = silverJeansInit;
