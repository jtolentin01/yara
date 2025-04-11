const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        chatId: {
            type: String,
            required: true,
            unique: true,
        },
        participants: {
            type: Array,
        },
        messages: {
            type: Array,
        },
        createby: {
            type: String,
        },
        updatedby: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

schema.set('autoIndex', false);
schema.index({ _id: 1 });

module.exports = mongoose.model("chats", schema); 
