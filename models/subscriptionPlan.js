const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, unique: true, trim: true},
    description: {type: String, required: true,trim: true},
    price: {type: Number, required: true, min: 0},
    duration: {type: Number, required: true},
    features: {type: [String], default: []},
    isActive: {type: Boolean, default: true},
    currency: {type: String, default: "INR" },
    trialPeriod: {type: Number, default: 0}, // In days
  },
  { timestamps: true }
);

module.exports = mongoose.model("subscriptionPlan", subscriptionPlanSchema);
