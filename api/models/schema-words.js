const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        words: {
            type: Array, 
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

module.exports = mongoose.model("words", schema); 
