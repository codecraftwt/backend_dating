const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    profileFor: { type: String, require: true },
    gender: { type: String, require: true },
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    dob: { type: String, require: true },
    religion: { type: String, require: true },
    motherTongue: { type: String, require: true },
    country: { type: String, require: true },
    email: { type: String, require: true },
    mobile: { type: String, require: true },
    age: { type: Number, require: false },
    password: { type: String, require: true },
    isDelete: { type: Number, default: 1 },
    designation: { type: String },
    profilePhoto: { type: String },
    otherPhotos: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    biodata: { type: String },
    subscription: {
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subscriptionPlan", // Reference to the SubscriptionPlan model
        },
        endDate: { type: Date }, // Subscription end date
        paymentId: { type: String }, // Payment ID from Stripe or other payment gateway
        status: { type: String, enum: ["active", "inactive", "canceled"], default: "inactive" },
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isFavorited: { type: Boolean, default: false },
    isLiked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);
