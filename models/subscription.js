const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    email: { type: String, require: true },
    stripeCustomerId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("subscriptions", subscriptionSchema);
