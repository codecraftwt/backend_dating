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
    biodata: {
        type: String,
        required: false,
        validate: {
            validator: function(value) {
                // Regular expression to check if the file is of allowed type (image, pdf, word)
                const fileExtensionRegex = /\.(jpg|jpeg|png|pdf|doc|docx)$/i;
                return fileExtensionRegex.test(value);
            },
            message: 'Biodata file must be an image (JPG, JPEG, PNG), PDF, or Word file (DOC, DOCX)'
        }
    }
}, { timestamps: true });

// userSchema.method({
//     async authenticate(userPassword: any, password: any) {
//         return await bcrypt.compare(userPassword, password);
//     },
// });
module.exports = mongoose.model("users", userSchema);
