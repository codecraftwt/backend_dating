const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    profileFor: { type: String, required: true },
    gender: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
    ethnicity: { type: String },
    religion: { type: String, required: true },
    motherTongue: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: false },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    education: { type: String, required: true },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"], default: "single", required: true },
    wishForChildren: { type: String },
    childrens: { type: String },
    searchingFor: { type: String, required: true },
    password: { type: String, required: true },
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
        status: { type: String, enum: ["active", "inactive", "canceled"], default: "active" },
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isFavorited: { type: Boolean, default: false },
    isLiked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);
