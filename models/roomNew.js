const mongoose = require('mongoose');

const roomNewSchema = new mongoose.Schema({
    createdBy: {
        type: Object,
        required: true,
    },
    createdWith: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    profile: {
        type: Object,
    },
    chat: [
        {
            senderId: { type: String, required: true },
            receiverId: { type: String, required: true },
            message: { type: String, required: true },
            files: [{
            url: { type: String },
            type: { type: String },
            name: { type: String },
        }],
            timestamp: { type: Date, default: Date.now },
        }
    ],
});

const RoomNew = mongoose.model('RoomNew', roomNewSchema);

module.exports = RoomNew;
