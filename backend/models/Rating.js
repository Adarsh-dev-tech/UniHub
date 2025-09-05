const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure one rating per user per resource
ratingSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);