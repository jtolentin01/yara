const { appendFileSync } = require("fs");
const { batches } = require("../../models/index");

const getAllBatches = async () => {
    const allBatches = await batches.find();
}

module.exports = { getAllBatches };