const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');
const { getCookieByAccount } = require('../middlewares/amz-api');

const getTrackingNo = async (req, res, next, batchId) => {
    const { productIDs, carrier } = req.body;
    const resultArr = [];
    try {
        const getTrackingNoExec = async (maxRetries = 3, delayMs = 3000) => {
            return new Promise(async (resolve, reject) => {
                const accountCookie = await getCookieByAccount('fedex');
                console.log(`accountCookie: ${JSON.stringify(accountCookie)}`);
                const url = `https://api.fedex.com/track/v2/shipments/visibilitieslist`;
                const options = {
                    method: 'POST',
                    headers: {
                        'Cookie': accountCookie.cookie,
                        'Authorization': `Bearer l7b8ada987a4544ff7a839c8e1f6548eea`,
                        'Content-Type': 'application/json',
                        'User-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`,
                    },
                };

                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                const fetchData = async (pageToken) => {
                    try {
                        const body = JSON.stringify({
                            "appDeviceType": "WTRK",
                            "appType": "WTRK",
                            "processingParameters": {},
                            "uniqueKey": "",
                            "dvx_Customer": "true",
                            "pageSize": "500",
                            "pageToken": pageToken,
                            "sort": "EDD",
                            "updatedSinceTs": ""
                        });

                        const response = await fetch(url, { ...options, body });
                        const data = await response.json();

                        console.log(`Requesting page with token: ${pageToken}`);
                        console.log(`Shipments Count: ${data.output.shipmentLightInfo.length}`); // Log shipment count in the response

                        return data;
                    } catch (error) {
                        console.error("Error fetching data:", error);
                        throw error;
                    }
                };

                const allShipments = [];
                let pageToken = 1; // Start with initial pageToken
                let hasMoreShipments = true;

                const fetchAllShipments = async () => {
                    let retryCount = maxRetries;
                    while (hasMoreShipments && retryCount > 0) {
                        try {
                            const data = await fetchData(pageToken);

                            const shipmentLightInfo = data.output.shipmentLightInfo;
                            allShipments.push(...shipmentLightInfo);

                            // If less than 500 shipments are returned, we're done
                            if (shipmentLightInfo.length < 500) {
                                hasMoreShipments = false;
                            }

                            // Increment pageToken by 500 for the next request
                            pageToken += 500;

                            // Delay before the next request
                            await delay(delayMs);

                        } catch (error) {
                            if (retryCount > 0) {
                                retryCount--;
                                console.log(`Retrying... Attempts left: ${retryCount}`);
                                await delay(delayMs); // wait before retrying
                            } else {
                                reject(error);
                            }
                        }
                    }

                    // When finished fetching all pages
                    resolve(allShipments);
                };

                fetchAllShipments();
            });
        };

        const getTrackingDetails = async (trackingNo, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const url = `https://api.fedex.com/track/v2/shipments`;
                const searchCookie = await getCookieByAccount('fedex_search');
                console.log(`searchCookie: ${JSON.stringify(searchCookie)}`);
                const options = {
                    method: 'post',
                    headers: {
                        'Cookie': searchCookie.cookie,
                        'Authorization': `Bearer l7b8ada987a4544ff7a839c8e1f6548eea`,
                        'Content-Type': 'application/json',
                        'User-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`
                    },
                    body: JSON.stringify({
                        "appDeviceType": "WTRK",
                        "appType": "WTRK",
                        "supportHTML": true,
                        "supportCurrentLocation": true,
                        "trackingInfo": trackingNo.map(item => ({
                            "trackNumberInfo": {
                                "trackingCarrier": "",
                                "trackingNumber": item,
                                "trackingQualifier": ""
                            }
                        })),
                        "uniqueKey": "",
                        "guestAuthenticationToken": ""
                    })
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(url, options);
                        const data = await response.json();
                        resolve(data?.output?.packages);
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

        const extractResult = (data, searchExtraction = false, refProductIds=null) => {
            const resultArray = [];
            let matchedItem;
            let ref = searchExtraction ? refProductIds : productIDs;
            ref.forEach((productID) => {
                
                if (searchExtraction) {
                    matchedItem = data.find((item) => item.trackingNbr === productID);
                    console.log(`search Extraction: ${JSON.stringify(matchedItem)}`);
                    if (matchedItem) {
                        resultArray.push({
                            trackingNo: matchedItem.trackingNbr || '-',
                            trackingQualifier: matchedItem.trackingQualifier || '-',
                            carrierDesc: matchedItem.serviceDesc || '-',
                            displayDepartDt: matchedItem.displayShipDt || '-',
                            serviceDescription: matchedItem.serviceDesc || '-',
                            statWithDetails: matchedItem.lastScanStatus || '-',
                            keyStat: matchedItem.keyStatus || '-',
                            notFoundOnInitial: false,
                        });
                    } else {
                        resultArray.push({
                            trackingNo: productID,
                            trackingQualifier: '-',
                            carrierDesc: '-',
                            displayDepartDt: '-',
                            serviceDescription: '-',
                            statWithDetails: '-',
                            keyStat: '-',
                            notFoundOnInitial: true,
                        });
                    }
                } else {
                    matchedItem = data.find((item) => item.trkNbr === productID);
                    if (matchedItem) {
                        resultArray.push({
                            trackingNo: matchedItem.trkNbr || '-',
                            trackingQualifier: matchedItem.trackingQualifier || '-',
                            carrierDesc: matchedItem.carrDesc || '-',
                            displayDepartDt: matchedItem.dispTndrDtTm || '-',
                            serviceDescription: matchedItem.srvDesc || '-',
                            statWithDetails: matchedItem.statWithDet || '-',
                            keyStat: matchedItem.keyStat || '-',
                            notFoundOnInitial: false,
                        });
                    } else {
                        resultArray.push({
                            trackingNo: productID,
                            trackingQualifier: '-',
                            carrierDesc: '-',
                            displayDepartDt: '-',
                            serviceDescription: '-',
                            statWithDetails: '-',
                            keyStat: '-',
                            notFoundOnInitial: true,
                        });
                    }
                }

            });

            return resultArray;
        };

        const data = await getTrackingNoExec();
        const extractedResult = extractResult(data);
        // const extractedResult = [{trackingNo:"284591498544",notFoundOnInitial:true},{trackingNo:"412613447103",notFoundOnInitial:true},{trackingNo:"412613446883",notFoundOnInitial:true},]
        resultArr.push(...extractedResult);
        if (extractedResult.some((item) => item.notFoundOnInitial === true)) {
            const notFoundTrackingNos = extractedResult
                .filter((item) => item.notFoundOnInitial === true)
                .map((item) => item.trackingNo);

            const chunkSize = 30;
            const chunkedTrackingNo = [];
            const chunkedTrackingNoResult = [];
            for (let i = 0; i < notFoundTrackingNos.length; i += chunkSize) {
                chunkedTrackingNo.push(notFoundTrackingNos.slice(i, i + chunkSize));
            }

            for (let i = 0; i < chunkedTrackingNo.length; i++) {
                const chunk = chunkedTrackingNo[i];
                console.log(chunk);

                const chunkResult = await getTrackingDetails(chunk);

                chunkedTrackingNoResult.push(...chunkResult);
                await delay(800);

                const progress = Math.round(((i + 1) / chunkedTrackingNo.length) * 100);
                await updateBatchProgress(batchId, progress);
            }
            const extractSearchResult = extractResult(chunkedTrackingNoResult, true, notFoundTrackingNos);
            console.log(`Extracted Search Result: ${extractSearchResult}`);
            resultArr.push(...extractSearchResult);
        }
    
        console.log('Final Result:', resultArr);
        console.log('done')

        let headers = [
            { header: "Tracking No", key: "trackingNo", width: 15 },
            { header: "Tracking Qualifier", key: "trackingQualifier", width: 15 },
            { header: "Carrier Description", key: "carrierDesc", width: 15 },
            { header: "Departed Date", key: "displayDepartDt", width: 15 },
            { header: "Service Description", key: "serviceDescription", width: 15 },
            { header: "Status with Details", key: "statWithDetails", width: 15 },
            { header: "Key status", key: "keyStat", width: 15 },
        ];

        let renderFile = await createExcelFile(headers, resultArr);
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

module.exports = getTrackingNo;


// displayPickupDt -> x.output.packages[0].displayPickupDt   => dispTndrDtTm  check

// keyStatus -> x.output.packages[0].keyStatus   => keyStat check
// lastScanStatus -> x.output.packages[0].lastScanStatus   => statWithDet check
// lastScanDateTime -> x.output.packages[0].lastScanDateTime

// displayShipDt -> x.output.packages[0].displayShipDt => dispShpDt check

// serviceDesc -> x.output.packages[0].serviceDesc   => srvDesc check


// trackingQualifier -> x.output.packages[0].trackingQualifier - check
// trackingNbr -> x.output.packages[0].trackingNbr - check


// https://www.fedex.com/fedextrack/?trknbr=283642563275&trkqual=12028~283642563275~FDEG