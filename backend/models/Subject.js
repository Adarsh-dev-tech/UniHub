const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  professorName: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    min: 1,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
subjectSchema.index({ branch: 1, year: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);