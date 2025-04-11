const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    batchid: {
      type: String,
      required: true,
      unique: true,
    },
    batchname: {
      type: String,
      required: true,
    },
    tool: {
      type: String,
      required: true,
    },
    toolname: {
      type: String,
    },
    totalitems: {
      type: Number,
      default: 0,
    },
    requestorname: {
      type: String,
      required: true,
    },
    requestorid: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 1,
    },
    progress: {
      type: Number,
      default: 0,
    },
    resubmitcount: {
      type: Number,
      default: 0,
    },
    importdata: {
      type: Array,
      default: [],
    },
    info: {
      type: Array,
      default: [],
    },
    createby: {
      type: String,
      required: true,
    },
    updatedby: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

schema.set('autoIndex', false);
schema.index({ _id: 1 });


module.exports = mongoose.model("batches", schema);
