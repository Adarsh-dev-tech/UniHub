const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  subjectCode: {
    type: String,
    required: [true, 'Subject code is required'],
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
    required: [true, 'Branch is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 5
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for efficient querying
subjectSchema.index({ branch: 1, year: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);