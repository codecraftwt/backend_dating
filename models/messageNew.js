const mongoose = require('mongoose');

const messageNewSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const MessageNew = mongoose.model('MessageNew', messageNewSchema);

module.exports = MessageNew;