const { batches, parserbatches } = require("../../models/index");

const updateBatchStatus = async (id, status) => {
  try {
    const query = { batchid: id };
    const update = { $set: { status: status } };
    const updateExecute = await batches.updateOne(query, update);
    return updateExecute;
  } catch (err) {
    console.error(err);
  }
};

const updateBatchProgress = async (batchid, progress) => {
  try {
    await batches.findOneAndUpdate({ batchid }, { progress });
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const updateBatchTotalItems = async (batchid, totalitems) => {
  try {
    await batches.findOneAndUpdate({ batchid }, { totalitems });
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const updateBatchInfo = async (batchid, newInfo) => {
  try {
    await batches.findOneAndUpdate(
      { batchid },
      { $push: { info: newInfo } }
    );
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const updateParserDlKey = async (batchid, url) => {
  try {
    const query = { batchid: batchid };
    const update = { $set: { downloadKey: url, status: 3 } };
    await parserbatches.updateOne(query, update);
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const updateParserInfo = async (batchid, newInfo) => {
  try {
    await batches.findOneAndUpdate(
      { batchid },
      {
        $push: { info: newInfo },
        $set: { status: 2 }
      }
    );
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const checkForDupBatch = async (batchid) => {
  try {
    const batchResult = await batches.findOne({ batchid: batchid });
    if (batchResult) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.error("Error checking for DUP Batches:", error);
  }
}

module.exports = { updateBatchStatus, updateBatchProgress, updateBatchInfo, updateBatchTotalItems, updateParserDlKey, updateParserInfo, checkForDupBatch };
