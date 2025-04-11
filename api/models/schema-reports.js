const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        ticket: {
            type: Number,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed, 
        },
        createby:{
            type: String,
        },
        updatedby:{
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

schema.set('autoIndex', false); 
schema.index({ _id: 1 });

module.exports = mongoose.model("reports", schema); 
