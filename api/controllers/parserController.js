const { newBatchId } = require("./utils/misc-utils");
const { parseUserData } = require("./utils/restapis-utils");
const { parserbatches, users } = require("../models/index");
const { parsers } = require("./indexController");
const parseMuckBootsInv = require('./parserControllerMain/Inventory/muck-boots');
const parseBogsInv = require('./parserControllerMain/Inventory/bogs');
const parseVolatileInv = require('./parserControllerMain/Inventory/volatile');
const parseFlojosInv = require('./parserControllerMain/Inventory/flojos');
const parseReebokInv = require('./parserControllerMain/Inventory/reebok');
const parseKaepaInv = require('./parserControllerMain/Inventory/kaepa');

const newRequest = async (req, res, next) => {
    try {
        const user = parseUserData(req);
        const { parser, filename, importType } = req.body
        const parserName = parsers.find((parserObject) => parserObject.subname === parser)?.name || "-";
        const brand = parsers.find((parserObject) =>
            parserObject.brands.find((brand) => brand.brandcode === importType)
        )?.brands.find((brand) => brand.brandcode === importType)?.brandname || "-";
        let batchId;
        const createBatchAndUpdateUser = async (batchId, initFunction) => {
            await parserbatches.create({
                batchid: batchId,
                parser: parser,
                parsername: parserName,
                importfile: filename,
                importType: brand,
                requestorid: user._id,
                status: 1,
                importdata: req.body,
                downloadKey: '',
                createdby: user._id,
                updatedby: user._id,
            });

            await users.findOneAndUpdate(
                { internalid: user.id },
                { $inc: { requestbatches: 1 } }
            );

            await initFunction(req, res, next, batchId);
        };

        try {
            switch (parser) {
                case "parser-inv":
                    batchId = await newBatchId("INV");
                    switch (importType) {
                        case 'muckboots':
                            await createBatchAndUpdateUser(batchId, parseMuckBootsInv);
                            break;
                        case 'bogs':
                            await createBatchAndUpdateUser(batchId, parseBogsInv);
                            break;
                        case 'volatile':
                            await createBatchAndUpdateUser(batchId, parseVolatileInv);
                            break;
                        case 'flojos':
                            await createBatchAndUpdateUser(batchId, parseFlojosInv);
                            break;
                        case 'reebok':
                            await createBatchAndUpdateUser(batchId, parseReebokInv);
                            break;
                        case 'kaepa':
                            await createBatchAndUpdateUser(batchId, parseKaepaInv);
                            break;

                        default:
                            return res.status(200).json({ message: 'Unsupported Import Type' });
                    }
                    break;
                default:
                    return res.status(200).json({ message: 'Unsupported Parser' });
            }
        } catch (error) {
            next(error);
        }
    }
    catch (error) {
        return res.status(500).json({ err: error.message });
    }
}

const getParserBatches = async (req, res, next) => {
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
            batchQuery = parserbatches
                .find(query, { importdata: 0, resubmitcount: 0 })
                .populate({ path: 'requestorid', select: 'firstname lastname' })
                .populate({ path: 'createdby', select: 'firstname lastname' })
                .populate({ path: 'updatedby', select: 'firstname lastname' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(items);
            totalBatches = parserbatches.find(query).countDocuments();
        } else {
            batchQuery = parserbatches
                .find({}, { importdata: 0 })
                .populate({ path: 'requestorid', select: 'firstname lastname' })
                .populate({ path: 'updatedby', select: 'firstname lastname' })
                .populate({ path: 'createdby', select: 'firstname lastname' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(items);
            totalBatches = parserbatches.find({}).countDocuments();
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

const deleteParserBatches = async (req, res, next) => {
    try {
        const { batchid } = req.params;

        if (!batchid) {
            return res.status(400).json({ message: 'Batch ID is required' });
        }

        const result = await parserbatches.deleteOne({ batchid: batchid });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.status(200).json({
            message: 'Batch deleted successfully',
            batchId: batchid,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { newRequest, getParserBatches, deleteParserBatches }