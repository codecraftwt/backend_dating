const mongoose = require("mongoose");
const connectDB = (url) => {
    console.log('connected to the database')
    return mongoose.connect(url)
}

module.exports = connectDB;