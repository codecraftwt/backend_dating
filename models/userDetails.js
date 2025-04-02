const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true
    },
    interestsAndHobbies: { type: [String], default: [] },
    sports: { type: [String], default: [] },
    travelling: { type: [String], default: [] },
    bodyType: { type: String },
    ethnicity: { type: String },
    // highestDegree: { type: String },
    languages: { type: [String], default: [] },
    smokingHabits: { type: String },
    workoutFrequency: { type: String },
    alcoholFrequency: { type: String },
    maritalStatus: { type: String },
    children: { type: String },
    // wishForChildren: { type: String },
    religion: { type: String },
    profileSummary: { type: String },
    foodAndDrink: { type: [String], default: [] },
    characterAndTraits: { type: [String], default: [] },
    lifeStyle: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("userDetails", userDetailsSchema);