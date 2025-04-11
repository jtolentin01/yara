const { getSellerCentralCookie } = require('../middlewares/amz-api');
const { uploadFileToS3 } = require('../middlewares/aws');
const { createExcelFile } = require('../utils/excel-utils');
const { delay } = require('../utils/misc-utils');
const { updateBatchStatus, updateBatchProgress, updateBatchInfo } = require('../middlewares/msc');

const getShipmentInit = async (req, res, next, batchId) => {
    const { productIDs, marketPlace } = req.body;
    const cookies = await getSellerCentralCookie(marketPlace);

    try {
        let result = [];

        const getShipmentExec = async (shipmentId, maxRetries = 3, delayMs = 1300) => {
            return new Promise(async (resolve, reject) => {
                const baseUrl = `https://sellercentral.amazon.com/fba/shippingqueue/api/v1/shipment/queryShipment?shipmentId=${shipmentId}&t2pLaunched=true`;
                const options = {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', 'Cookie': cookies.cookie }
                };
                const fetchData = async (retryCount) => {
                    try {
                        const response = await fetch(baseUrl, options);
                        if (response.status === 400) {
                            resolve(response);
                        }
                        else if (!response.ok){
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
            const shipmentDetails = await getShipmentExec(productIDs[i]);
            if (shipmentDetails.shipmentName) {
                result.push({
                    shipmentId: productIDs[i] || '-',
                    shipmentName: shipmentDetails?.shipmentName || '-',
                    shipmentStatus: shipmentDetails?.shipmentStatus || '-',
                    totalShipped: shipmentDetails?.shippedQuantity || '0',
                    totalReceived: shipmentDetails?.receivedQuantity || '0',
                    expectedQuantity: shipmentDetails?.expectedQuantity || '0',
                    shippedTo: shipmentDetails?.destinationFC || '-',
                    skus: shipmentDetails?.mskus || '-',
                    fcAddress: shipmentDetails?.fcAddress || '-',
                    shipDeliveryWindow: shipmentDetails?.shipOrDeliveryWindow?.windowType || '-',

                });
            } else {
                result.push({
                    shipmentId: productIDs[i],
                    shipmentName: '-',
                    shipmentStatus: '-',
                    totalShipped: '-',
                    totalReceived: '-',
                    expectedQuantity: '-',
                    shippedTo: '-',
                    skus: '-',
                    fcAddress:  '-',
                    shipDeliveryWindow: '-',
                });
            }
            await delay(800);
            const progress = Math.round((i + 1) / productIDs.length * 100);
            await updateBatchProgress(batchId, progress);
        }

        const headers = [
            { header: "Shipment ID", key: "shipmentId", width: 15 },
            { header: "Shipment Status", key: "shipmentName", width: 15 },
            { header: "Shipment Status", key: "shipmentStatus", width: 15 },
            { header: "Total Shipped", key: "totalShipped", width: 15 },
            { header: "Total Received", key: "totalReceived", width: 15 },
            { header: "Expected Quantity", key: "expectedQuantity", width: 15 },
            { header: "Shipped To", key: "shippedTo", width: 15 },
            { header: "SKUs", key: "skus", width: 15 },
            { header: "FC Address", key: "fcAddress", width: 15 },
            { header: "Ship or Delivery Window", key: "shipDeliveryWindow", width: 15 },
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

module.exports = getShipmentInit;
