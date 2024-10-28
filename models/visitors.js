const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visitedId: { type: mongoose.Schema.Types.ObjectId, required: true },
    visitor: { type: Object, ref: 'User' },
    visitedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);