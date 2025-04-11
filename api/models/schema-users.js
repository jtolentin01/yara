const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    internalid: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    middlename: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      default: ""
    },
    accesslevel: {
      type: Number,
      default: 1,
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    isonline: {
      type: Boolean,
      default: false,
    },
    lastonline: {
      type: String,
    },
    department: {
      type: String,
    },
    requestbatches: {
      type: Number,
      default: 0,
    },
    createby: {
      type: String,
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


module.exports = mongoose.model("users", schema);
