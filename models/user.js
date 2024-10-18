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
    isDelete: { type: Number, default: 1 }
}, { timestamps: true });

// userSchema.method({
//     async authenticate(userPassword: any, password: any) {
//         return await bcrypt.compare(userPassword, password);
//     },
// });
module.exports = mongoose.model("users", userSchema);
