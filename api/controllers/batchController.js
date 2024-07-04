const asinCheckerLiteInit = require("./toolsControllerMain/asin-checker-lite");
const { newBatchId, newTimeStamp } = require("./utils/misc-utils");
const { parseUserData } = require("./utils/restapis-utils");
const { batches, users } = require("../models/index");

const newBatch = async (req, res, next) => {
  const { tool, importName, productIDs } = req.body;
  const user = parseUserData(req);

  try {
    switch (tool) {
      case "asin-checker-v2":
        const batchId = newBatchId("ACL");
        await batches.create({
          batchid: batchId,
          batchname: importName,
          tool: tool,
          totalitems: productIDs.length,
          requestorname: `${user.firstname} ${user.lastname}`,
          requestorid: user.id,
          status: 1,
          progress: 0,
          createby: `${user.firstname} ${user.lastname}`,
          updatedby: `${user.firstname} ${user.lastname}`,
        });
        await users.findOneAndUpdate({ internalid: user.id }, { $inc: { requestbatches: 1 } });
        await asinCheckerLiteInit(req, res, next, batchId); 
        console.log("Finish Execution!");
        break;
      case "listing-loader-v2":
        break;
      default:
        throw new Error(`Unsupported tool: ${tool}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error); // Forward error to error handling middleware
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
      query.filter = filter;
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
      batchQuery = batches.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(items);
      totalBatches = batches.find(query).countDocuments();
    } else {
      batchQuery = batches.find({})
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



module.exports = { newBatch, getBatches, deleteBatches };
