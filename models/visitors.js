const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitor: {
    firstName: String,
    lastName: String,
    dob: Date,
    country: String,
    email: String,
    age: Number,
    likes: Number,
    isFavorited: Boolean
  },
  visited: {
    firstName: String,
    lastName: String,
    dob: Date,
    country: String,
    email: String,
    age: Number,
    likes: Number,
    isFavorited: Boolean
  },
  visitedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visit', visitSchema);