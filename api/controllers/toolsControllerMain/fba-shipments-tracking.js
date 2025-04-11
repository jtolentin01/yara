const { getSellerCentralCookie } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const getFbaShipmentsInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace } = req.body;
    const cookies = await getSellerCentralCookie(marketPlace);

    try {
        let result = [];

        const getFbaShipmentsExec = async (shipmentId, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/fba/inbound-shipment/summary/shipment-info/${shipmentId}`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (response.status === 400 || response.status === 404) {
                            resolve(response);
                        }
                        else if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for Get Shipment Execution - ID: ${shipmentId}`);
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

        for (let i = 0; i < productIDs.length; i++) {
            const shipmentDetails = await getFbaShipmentsExec(productIDs[i]);
            if (shipmentDetails.shipmentName) {
                result.push({
                    shipmentId: productIDs[i] || '-',
                    shipmentName: shipmentDetails?.shipmentName || '-',
                    shipmentStatus: shipmentDetails?.shipmentStatus || '-',
                    amzRefNo: shipmentDetails?.purchaseOrderId || '-',

                    shipFromOwnerName: shipmentDetails.shipFromAddress?.addressOwnerName || '-',
                    shipFromLine1: shipmentDetails.shipFromAddress?.addressLine1 || '-',
                    shipFromLine2: shipmentDetails.shipFromAddress?.addressLine2 || '-',
                    shipFromCity: shipmentDetails.shipFromAddress?.city || '-',
                    shipFromStateReg: shipmentDetails.shipFromAddress?.stateOrRegion || '-',
                    shipFromDistCo: shipmentDetails.shipFromAddress?.districtOrCounty || '-',
                    shipFromPostal: shipmentDetails.shipFromAddress?.postalCode || '-',
                    shipFromCounryCode: shipmentDetails.shipFromAddress?.countryCode || '-',

                    shipToName: shipmentDetails.shipToAddress?.name || '-',
                    shipToLine1: shipmentDetails.shipToAddress?.addressLine1 || '-',
                    shipToLine2: shipmentDetails.shipToAddress?.addressLine2 || '-',
                    shipToCity: shipmentDetails.shipToAddress?.city || '-',
                    shipToState: shipmentDetails.shipToAddress?.state || '-',
                    shipToDistrict: shipmentDetails.shipToAddress?.district || '-',
                    shipToCountryCode: shipmentDetails.shipToAddress?.countryCode || '-',
                    shipToPostalCode: shipmentDetails.shipToAddress?.postalCode || '-',

                    skus: shipmentDetails?.totalLineItems || '0',
                    units: shipmentDetails?.totalShippedQty || '0',

                    carrierShipmentName: shipmentDetails.carrierShipmentInfo?.carrierName || '-',
                    carrierShipmentType: shipmentDetails.carrierShipmentInfo?.shipmentType || '-',

                    inboundPlacementFees: shipmentDetails.inboundPlacementFees?.amount || '0',
                    fbaManualProcessingFee: shipmentDetails.carrierShipmentInfo?.manualProcessingFee || '0',

                });
            } else {
                result.push({
                    shipmentId: productIDs[i],
                    shipmentName: '-',
                    shipmentStatus: shipmentDetails?.status === 404 ? '404 Possibly Working or Invalid Tracking' : '-',
                    amzRefNo: '-',
                    shipFromOwnerName: '-',
                    shipFromLine1: '-',
                    shipFromLine2: '-',
                    shipFromCity: '-',
                    shipFromStateReg: '-',
                    shipFromDistCo: '-',
                    shipFromPostal: '-',
                    shipFromCounryCode: '-',
                    shipToName: '-',
                    shipToLine1: '-',
                    shipToLine2: '-',
                    shipToCity: '-',
                    shipToState: '-',
                    shipToDistrict: '-',
                    shipToCountryCode: '-',
                    shipToPostalCode: '-',
                    skus: '-',
                    units: '-',
                    carrierShipmentName: '-',
                    carrierShipmentType: '-',
                    inboundPlacementFees: '-',
                    fbaManualProcessingFee: '-',
                });
            }
            await delay(800);
            const progress = Math.round((i + 1) / productIDs.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const headers = [
            { header: "Shipment ID", key: "shipmentId", width: 15 },
            { header: "Shipment Name", key: "shipmentName", width: 15 },
            { header: "Shipment Status", key: "shipmentStatus", width: 15 },
            { header: "Amazon Ref No.", key: "amzRefNo", width: 15 },
            { header: "Ship From Name", key: "shipFromOwnerName", width: 15 },
            { header: "Address Line 1", key: "shipFromLine1", width: 15 },
            { header: "Address Line 2", key: "shipFromLine2", width: 15 },
            { header: "Ship From City", key: "shipFromCity", width: 15 },
            { header: "Ship From state", key: "shipFromStateReg", width: 15 },
            { header: "Ship from District", key: "shipFromDistCo", width: 15 },
            { header: "Ship from Postal", key: "shipFromPostal", width: 15 },
            { header: "Ship from country code", key: "shipFromCounryCode", width: 15 },
            { header: "Shipment to Name", key: "shipToName", width: 15 },
            { header: "Ship To Line 1", key: "shipToLine1", width: 15 },
            { header: "Ship To Line 2", key: "shipToLine2", width: 15 },
            { header: "Ship to City", key: "shipToCity", width: 15 },
            { header: "Ship to State", key: "shipToState", width: 15 },
            { header: "Ship to District", key: "shipToDistrict", width: 15 },
            { header: "Ship to Country code", key: "shipToCountryCode", width: 15 },
            { header: "Ship to Postal", key: "shipToPostalCode", width: 15 },
            { header: "Skus", key: "skus", width: 15 },
            { header: "Units", key: "units", width: 15 },
            { header: "Carrier Shipment Name", key: "carrierShipmentName", width: 15 },
            { header: "Carrier Shipment Type", key: "carrierShipmentType", width: 15 },
            { header: "Inbound Placement Fee", key: "inboundPlacementFees", width: 15 },
            { header: "FBA Manual Processing Fee", key: "fbaManualProcessingFee", width: 15 },
            
        ];
        let renderFile = await createExcelFile(headers, result);

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
}

module.exports = getFbaShipmentsInit;
