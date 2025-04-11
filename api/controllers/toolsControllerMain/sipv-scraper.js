const { getSellerCentralCookie, getMarketPlaceIDs } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay, extractTrueValues, convertSipv } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo, updateBatchTotalItems } = require('../middlewares/msc');

const sipvScraperInit = async (req, res, next, batchId) => {
    try {
        const { marketPlace } = req.body;
        const cookies = await getSellerCentralCookie(marketPlace);

        const getSummary = async (maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/performance/api/summary`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie, 'Accept-Language': 'en-US,en;q=0.9' }
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for getting the summary`);
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
            })
        }

        const getPolicyData = async (metrics, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const metricsList = metrics.join(',');
                const summary = await getSummary();
                const startDate = new Date(summary.listingLevelMetrics.IntellectualProperty.timeFrame.start).toISOString().split('T')[0];
                const endDate = new Date(summary.listingLevelMetrics.IntellectualProperty.timeFrame.end).toISOString().split('T')[0]
                if (metricsList.length === 0) {
                    resolve([]);
                }
                const baseUrl = `https://sellercentral.amazon.com/performance/api/product/policy/defects/pagination?metricNames=${metricsList}&pageSize=1000&duration=180&offset=0&startDate=${startDate}&endDate=${endDate}&nextPageToken=&statuses=Open&sortField=CREATION_DATE&sortByOrder=DESC&vendorCode=&searchValues=&policyGroups=`;
                const options = {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for getPolicyData`);
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

        const getComplianceRequest = async (delayMs = 1000) => {
            return new Promise(async (resolve, reject) => {
                let pageOffset = 1;
                let pageSize = 1000;
                let resultArr = [];
                let totalIssues = 0;

                const baseUrl = (offset) =>
                    `https://sellercentral.amazon.com/spx/myc/myc-backend-service/api/get-grain-compliance-requirement-issues?sellingPartnerType=SELLER&grainTypes=SKU&grainTypes=ASIN&grainTypes=RPG&pageOffset=${offset}&pageSize=${pageSize}&searchBy=ASIN&searchValue=&sortBy=GRAIN_GMS_60DAYS&sortDirection=DESCENDING&&grainProgramNames=PRODUCT_ASSURANCE&grainProgramNames=RLPSAS&grainProgramNames=HazardousGoodsSeller&grainProgramNames=EPR_DE_WEEE&grainProgramNames=HazardousGoods&grainProgramNames=eu_gpsr_markeplace_regulation&grainProgramNames=COSS_PRODUCT_SAFETY&grainProgramNames=COSS_FOOD_SAFETY&grainProgramNames=COSS_DIETARY_SUPPLEMENTS&grainRequirementIssueStatuses=ACTIVE&&&vendorCode=`;

                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie }
                };

                const fetchData = async (offset) => {
                    const response = await fetch(baseUrl(offset), options);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} for getComplianceRequest`);
                    }
                    const data = await response.json();
                    totalIssues = data.issueCount.incompleteCount;
                    resultArr.push(...data.issues);
                };
                try {
                    do {
                        await fetchData(pageOffset);
                        pageOffset += 1;
                        await delay(delayMs);
                    } while (resultArr.length < totalIssues);
                    resolve(resultArr);
                }
                catch (error) {
                    reject(error);
                }

            });
        };

        const convertProductPolicy = async (defects, maxRetries = 3, delayMs = 1500) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/performance/api/product/policy/defects/supplemental/info?merchantId=A7ULJO7NAWM0L&marketplaceId=${getMarketPlaceIDs(marketPlace)}`;
                const options = {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie, 'Accept-Language': 'en-US,en;q=0.9' },
                    body: JSON.stringify(defects)
                };

                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for convertProductPolicy`);
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

        const extractResult = (policyResult) => {
            const arrRes = [];
            policyResult.forEach(element => {
                arrRes.push(
                    {
                        metricName: element.metricName || '-',
                        reason: element.reasonMessage || '-',
                        brand: element.brandName || '-',
                        date: element.date || '-',
                        asin: element.asin || '-',
                        sku: element.sku || '-',
                        title: element.title || '-',
                        atRiskSales: element.issueList[0]?.parameters?.VIOLATION_LEVEL_GMS > 0 ? Math.round(element.issueList[0]?.parameters?.VIOLATION_LEVEL_GMS) : 'No sales in the past 12 months' || '-',
                        actionTaken: element.issueList[0]?.parameters?.attribute_name ? `${element.issueList[0]?.parameters?.attribute_name} Removed` : 'Listing removed' || '-'
                    }
                );
            });
            return arrRes;
        }

        const extractedMetrics = extractTrueValues(req.body);
        const metrics = extractedMetrics.filter(item => item !== 'ProductComplianceRequest');
        const exec = await getPolicyData(metrics);
        const resLength = exec?.defects?.length || 0;
        await updateBatchTotalItems(batchId, resLength);
        const convertPolicy = resLength === 0 ? [] : await convertProductPolicy(exec.defects);
        const extracted = extractResult(convertPolicy) || [];
        const convertedResult = convertSipv(extracted) || [];
        if (extractedMetrics.includes('ProductComplianceRequest')) {
            const complianceResult = await getComplianceRequest();
            const totalCounts = resLength + complianceResult.length;
            await updateBatchTotalItems(batchId, totalCounts);
            complianceResult.forEach(item => {
                convertedResult.push({
                    metricName: 'Product Compliance Request',
                    reason: `Missing Information: ${item.grainRequirementIssueInstances.map(item => item.requirementIssueData.missingInformation).join(', ')}` || '-',
                    brand: '-',
                    date: '-',
                    asin: item.grain || '-',
                    sku: item.offerInfo.map(item => item.sku).join(', '),
                    title: item.title || '-',
                })
            });
        }

        let headers = [
            { header: "Metric Name", key: "metricName", width: 15 },
            { header: "Brand", key: "brand", width: 15 },
            { header: "Reason", key: "reason", width: 25 },
            { header: "Asin", key: "asin", width: 15 },
            { header: "SKU", key: "sku", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Title", key: "title", width: 25 },
            { header: "At Risk Sales", key: "atRiskSales", width: 25 },
            { header: "Action Taken", key: "actionTaken", width: 25 }
        ];
        let renderFile = await createExcelFile(headers, convertedResult);
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

module.exports = sipvScraperInit;
