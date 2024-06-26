const { batches } = require("../../models/index");

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

module.exports = { updateBatchStatus, updateBatchProgress };
