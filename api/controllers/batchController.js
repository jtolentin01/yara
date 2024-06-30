const asinCheckerLiteInit = require("./toolsControllerMain/asin-checker-lite");
const { newBatchId, newTimeStamp } = require("./utils/misc-utils");
const { parseUserData } = require("./utils/restapis-utils");
const { batches } = require("../models/index");

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

        await asinCheckerLiteInit(req, res, next,batchId);
        console.log("Finish Execution!");
        break;
      case "listing-loader-v2":
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getBatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const items = parseInt(req.query.items) || 10;
    const filter = req.query.filter;
    const category = req.query.category;
    const skip = (page - 1) * items;

    const query = {};
    if (filter) {
      query.filter = filter;
    }
    if (category) {
      query.tool = category;
    }

    const batch = await batches.find(query).skip(skip).limit(items);
    const totalBatches = await batches.find(query).countDocuments();

    res.status(200).json({
      batch,
      totalBatches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { newBatch, getBatches };
