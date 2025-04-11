const asinCheckerLiteInit = require("./toolsControllerMain/asin-checker-lite");
const listingLoaderInit = require("./toolsControllerMain/listing-loader");
const listingIssuesInit = require("./toolsControllerMain/listing-issues");
const amazonReviewInit = require("./toolsControllerMain/amazon-review");
const addProductInit = require("./toolsControllerMain/add-product");
const editPageInit = require('./toolsControllerMain/edit-page');
const editPagePricingInit = require('./toolsControllerMain/edit-page-pricing');
const getParentInit = require('./toolsControllerMain/get-parent');
const amzProductIdInit = require('./toolsControllerMain/amz-product-id-checker');
const vocScraperInit = require('./toolsControllerMain/voc-scraper');
const primeExclusivesInit = require('./toolsControllerMain/prime-exclusives');
const skuExtractorInit = require('./toolsControllerMain/sku-extractor');
const amazonPageInit = require('./toolsControllerMain/amazon-page');
const sipvScraperInit = require('./toolsControllerMain/sipv-scraper');
const amazonWordInit = require('./toolsControllerMain/amazon-word-detector');
const scraperInit = require('./toolsControllerMain/web-scrapers/index');
const getShipmentInit = require('./toolsControllerMain/get-shipment-items');
const getDimensionInit = require('./toolsControllerMain/get-dimensions');
const getFbaShipmentsInit = require('./toolsControllerMain/fba-shipments-tracking');
const manageInventoryInit = require('./toolsControllerMain/manage-inventory');
const amzProdIssuesInit = require('./toolsControllerMain/amz-prod-issues');
const { newBatchId } = require("./utils/misc-utils");
const { parseUserData } = require("./utils/restapis-utils");
const { batches, users } = require("../models/index");
const { tools } = require("./indexController");
const getTrackingNo = require("./toolsControllerMain/getTrackingNo");
const priceDiscountScraperInit = require("./toolsControllerMain/price-discount-scraper");

const newBatch = async (req, res, next) => {
  const { tool, importName, productIDs, skuAsins } = req.body;
  const toolName = tools.find((toolObject) => toolObject.subname === tool)?.name || "-";
  const user = parseUserData(req);

  const createBatchAndUpdateUser = async (batchId, initFunction) => {
    let totalItems = (tool === 'listing-issues-v2' || tool === 'sipv-scraper') ? 0 : '-';
    await batches.create({
      batchid: batchId,
      batchname: importName || req.body.scraper,
      tool: tool,
      toolname: toolName,
      totalitems: totalItems === 0 ? 0 : skuAsins ? skuAsins.length : productIDs.length || 0,
      requestorname: `${user.firstname} ${user.lastname}`,
      requestorid: user.id,
      status: 1,
      progress: 0,
      importdata: req.body,
      createby: `${user.firstname} ${user.lastname}`,
      updatedby: `${user.firstname} ${user.lastname}`,
    });

    await users.findOneAndUpdate(
      { internalid: user.id },
      { $inc: { requestbatches: 1 } }
    );

    await initFunction(req, res, next, batchId);
  };

  try {
    switch (tool) {

      case "asin-checker-lite-v2":
        await createBatchAndUpdateUser(await newBatchId("ACL"), asinCheckerLiteInit);
        break;
      case "listing-loader-v2":
        await createBatchAndUpdateUser(await newBatchId("LL"), listingLoaderInit);
        break;
      case "add-product-v2":
        await createBatchAndUpdateUser(await newBatchId("AP"), addProductInit);
        break;
      case "listing-issues-v2":
        await createBatchAndUpdateUser(await newBatchId("LI"), listingIssuesInit);
        break;
      case "edit-page-v2":
        await createBatchAndUpdateUser(await newBatchId("EP"), editPageInit);
        break;
      case "edit-page-pricing":
        await createBatchAndUpdateUser(await newBatchId("EPP"), editPagePricingInit);
        break;
      case "amazon-review-v2":
        await createBatchAndUpdateUser(await newBatchId("AR"), amazonReviewInit);
        break;
      case "amazon-page":
        await createBatchAndUpdateUser(await newBatchId("AMP"), amazonPageInit);
        break;
      case "get-parent":
        await createBatchAndUpdateUser(await newBatchId("GP"), getParentInit);
        break;
      case "amz-id-checker":
        await createBatchAndUpdateUser(await newBatchId("PC"), amzProductIdInit);
        break;
      case "voc-v2":
        await createBatchAndUpdateUser(await newBatchId("VOC"), vocScraperInit);
        break;
      case "prime-exclusive-discount":
        await createBatchAndUpdateUser(await newBatchId("PEX"), primeExclusivesInit);
        break;
      case "sku-extractor":
        await createBatchAndUpdateUser(await newBatchId("SKU"), skuExtractorInit);
        break;
      case "sipv-scraper":
        await createBatchAndUpdateUser(await newBatchId("SI"), sipvScraperInit);
        break;
      case "amazon-word-detector":
        await createBatchAndUpdateUser(await newBatchId("AWD"), amazonWordInit);
        break;
      case "website-scraper":
        await createBatchAndUpdateUser(await newBatchId("WEB"), scraperInit);
        break;
      case "get-shipment-items":
        await createBatchAndUpdateUser(await newBatchId("GSI"), getShipmentInit);
        break;
      case "fba-shipments-tracking":
        await createBatchAndUpdateUser(await newBatchId("FBA"), getFbaShipmentsInit);
        break;
      case "get-dimensions":
        await createBatchAndUpdateUser(await newBatchId("GD"), getDimensionInit);
        break;
      case "manage-inventory":
        await createBatchAndUpdateUser(await newBatchId("MI"), manageInventoryInit);
        break;
      case "2dt-alternative":
        await createBatchAndUpdateUser(await newBatchId("2DT"), amzProdIssuesInit);
        break;
      case "get-tracking-no":
        await createBatchAndUpdateUser(await newBatchId("GTN"), getTrackingNo);
        break;
      case "price-discount-scraper":
        await createBatchAndUpdateUser(await newBatchId("PDS"), priceDiscountScraperInit);
        break;
      default:
        return res.status(200).json({ message: 'Unsupported Tool' });
    }
  } catch (error) {
    next(error);
  }
};

const resubmitBatch = async (req, res, next) => {
  const { batchId } = req.body;

  try {
    const batch = await batches.findOne({ batchid: batchId });

    if (!batch) {
      return res.status(200).json({ message: 'Batch not found' });
    }

    await batches.findOneAndUpdate(
      { batchid: batchId },
      {
        $inc: { resubmitcount: 1 },
        $set: { progress: 0 },
      }
    );

    req.body = batch.importdata[0];
    const { tool } = batch.importdata[0];

    switch (tool) {
      case "asin-checker-lite-v2":
        await asinCheckerLiteInit(req, res, next, batchId);
        break;
      case "listing-loader-v2":
        await listingLoaderInit(req, res, next, batchId);
        break;
      case "add-product-v2":
        await addProductInit(req, res, next, batchId);
        break;
      case "listing-issues-v2":
        await listingIssuesInit(req, res, next, batchId);
        break;
      case "edit-page-v2":
        await editPageInit(req, res, next, batchId);
        break;
      case "edit-page-pricing":
        await editPagePricingInit(req, res, next, batchId);
        break;
      case "amazon-review-v2":
        await amazonReviewInit(req, res, next, batchId);
        break;
      case "amazon-page":
        await amazonPageInit(req, res, next, batchId);
        break;
      case "get-parent":
        await getParentInit(req, res, next, batchId);
        break;
      case "amz-id-checker":
        await amzProductIdInit(req, res, next, batchId);
        break;
      case "voc-v2":
        await vocScraperInit(req, res, next, batchId);
        break;
      case "prime-exclusive-discount":
        await primeExclusivesInit(req, res, next, batchId);
        break;
      case "sku-extractor":
        await skuExtractorInit(req, res, next, batchId);
        break;
      case "sipv-scraper":
        await sipvScraperInit(req, res, next, batchId);
        break;
      case "amazon-word-detector":
        await amazonWordInit(req, res, next, batchId);
        break;
      case "website-scraper":
        await scraperInit(req, res, next, batchId);
        break;
      case "get-shipment-items":
        await getShipmentInit(req, res, next, batchId);
        break;
      case "fba-shipments-tracking":
        await getFbaShipmentsInit(req, res, next, batchId);
        break;
      case "get-dimensions":
        await getDimensionInit(req, res, next, batchId);
        break;
      case "manage-inventory":
        await manageInventoryInit(req, res, next, batchId);
        break;
      case "product-issues-checker":
        await amzProdIssuesInit(req, res, next, batchId);
        break;
      case "get-tracking-no":
        await getTrackingNo(req, res, next, batchId);
        break;
      case "price-discount-scraper":
        await priceDiscountScraperInit(req, res, next, batchId);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported Tool' });
    }
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
};

const getBatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const items = parseInt(req.query.items) || 15;
    const filter = req.query.filter;
    const category = req.query.category;
    const requestorid = req.query.requestorid;
    const importName = req.query.importname;
    const skip = (page - 1) * items;

    let query = {};

    if (filter) {
      query.status = filter;
    }
    if (requestorid) {
      query.requestorid = requestorid;
    }
    if (importName) {
      query.batchname = { $regex: new RegExp(importName, 'i') };
    }
    if (category) {
      query.tool = category;
    }

    let batchQuery;
    let totalBatches;

    if (Object.keys(query).length > 0) {
      batchQuery = batches
        .find(query, { importdata: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(items);
      totalBatches = batches.find(query).countDocuments();
    } else {
      batchQuery = batches
        .find({}, { importdata: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(items);
      totalBatches = batches.find({}).countDocuments();
    }

    const [batch, totalCount] = await Promise.all([batchQuery, totalBatches]);

    res.status(200).json({
      batch,
      totalBatches: totalCount,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBatches = async (req, res, next) => {
  try {
    const { batchid } = req.params;

    if (!batchid) {
      return res.status(400).json({ message: 'Batch ID is required' });
    }
    const result = await batches.deleteOne({ batchid: batchid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json({
      message: 'Batch deleted successfully',
      batchId: batchid,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { newBatch, getBatches, deleteBatches, resubmitBatch };
