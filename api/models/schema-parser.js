const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        batchid: {
            type: String,
            required: true,
            unique: true,
        },
        parser: {
            type: String,
            required: true,
        },
        parsername: {
            type: String,
        },
        importfile: {
            type: String,
        },
        importType: {
            type: String,
        },
        requestorid: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "users",
            required: true,
        },
        status: {
            type: Number,
            default: 1,
        },
        resubmitcount: {
            type: Number,
            default: 0,
        },
        importdata: {
            type: Array,
            default: [],
        },
        downloadKey: {
            type: String,
        },
        info: {
            type: Array,
            default: [],
        },
        createdby: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "users",
        },
        updatedby: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "users",
        },
    },
    {
        timestamps: true,
    }
);

schema.set('autoIndex', false);
schema.index({ _id: 1 });


module.exports = mongoose.model("parserbatches", schema);
