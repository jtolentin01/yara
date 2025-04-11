const { getSellerCentralCookie, getCookieForB2b } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { actualErrors, suppressedErrors } = require('./price-discount-scraper-ref');

const priceDiscountScraperInit = async (req, res, next, batchId) => {
    const { productIDs, account } = req.body;
    const cookies = account === "oe" ? await getSellerCentralCookie("US") : await getCookieForB2b(account);
    let resultArr = [];
    try {

        const getPromotionDetailsExec = async (promotionId, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/discounts/api/getPromotion?marketplaceId=ATVPDKIKX0DER&promotionId=${promotionId}&includeAsinMetrics=true`;
                const options = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': account === "oe" ? cookies.cookie : `${cookies.cookie};stck=EU;`,
                    },
                }
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            if (response.status === 429) {
                                await delay(15000);
                            } else if (response.status === 400) {
                                resolve([])
                            }
                            else {
                                throw new Error(`HTTP error! status for get promotion details: ${response.status}`);
                            }

                            if (retryCount > 0) {
                                await delay(delayMs);
                                return fetchData(retryCount - 1);
                            } else {
                                throw new Error(`Failed after ${maxRetries} retries`);
                            }
                        }
                        const data = await response.json();
                        resolve(data);
                    } catch (error) {
                        if (retryCount > 0) {
                            await delay(delayMs);
                            return fetchData(retryCount - 1);
                        } else {
                            reject(error);
                        }
                    }
                };

                fetchData(maxRetries);
            });
        };

        const convertErrors = (errorRef) => {
            const errors = errorRef
                ?.map((item) => actualErrors.find((x) => x.errorId === item))
                .filter(Boolean);

            return errors.map(error => ({
                ...error,
                isSuppressed: suppressedErrors.includes(error.errorId)
            }));
        };

        const extractPromotionData = (promotionDetails, promotionId) => {
            const resArr = [];
            const productSelectorList = promotionDetails?.productSelectorsList || [];
            const productWithClientErrors = productSelectorList?.filter((item) => item.clientErrors.length > 0) || [];
            if (productWithClientErrors.length > 0) {
                productWithClientErrors.forEach(item => {
                    const clientErr = convertErrors(item?.clientErrors.map((item) => (`${item?.errorName}_${item?.errorType}`))) || [];
                    resArr.push({
                        promotionId: promotionId,
                        asin: item?.asin || '-',
                        sku: item?.sku || '-',
                        discountAmount: item?.discountAmount || '-',
                        quantity: item?.quantity || '-',
                        price: item?.price || '-',
                        isSuppressed: clientErr.some(error => error.isSuppressed) || '-',
                        clientErrorName: clientErr.map((x) => x?.errorName).filter(Boolean).join(', ') || '-',
                        clientDescription: clientErr.map((x) => x?.errorDescription).filter(Boolean).join('\n\n') || '-'
                    })
                });
            } else {
                resArr.push({
                    promotionId: promotionId,
                    asin: '-',
                    sku: '-',
                    discountAmount: '-',
                    quantity: '-',
                    price: '-',
                    isSuppressed: '-',
                    clientErrorName: '-',
                    clientDescription: '-'
                })
            }

            return resArr;
        }

        for (const promotionId of productIDs) {
            const res = await getPromotionDetailsExec(promotionId);
            resultArr.push(...extractPromotionData(res.promotionDetails, promotionId));
        }

        const headers = [
            { header: "Promotion ID", key: "promotionId", width: 15 },
            { header: "ASIN", key: "asin", width: 15 },
            { header: "SKU", key: "sku", width: 15 },
            { header: "Discount Amount", key: "discountAmount", width: 15 },
            { header: "Quantity", key: "quantity", width: 15 },
            { header: "Price", key: "price", width: 15 },
            { header: "isSuppressed?", key: "isSuppressed", width: 15 },
            { header: "Error", key: "clientErrorName", width: 20 },
            { header: "Error Description", key: "clientDescription", width: 30 },
        ];

        const renderFile = await createExcelFile(headers, resultArr);
        await uploadFileToS3('downloads', renderFile, `${batchId}.xlsx`);
        await updateBatchProgress(batchId, 100);
        await updateBatchStatus(batchId, 3);
        res.status(200).json({ success: true });

    } catch (e) {
        console.error('Error:', error);
        await updateBatchStatus(batchId, 2);
        await updateBatchInfo(batchId, {
            error: error.message,
            stackTrace: error.stack
        });
    }
}

module.exports = priceDiscountScraperInit;



