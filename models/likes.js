const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isLike: { type: Boolean },
    createdAt: { type: Date, default: Date.now }
}).index({ userId: 1, likedProfileId: 1 }, { unique: true });

module.exports = mongoose.model("Like", LikeSchema);
