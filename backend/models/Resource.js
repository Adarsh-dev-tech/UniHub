const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: [
      'Course Plan',
      'CT Paper',
      'End Sem Paper',
      'PPT',
      'Class Notes',
      'Reference Book',
      'YouTube Link',
      'Custom' // For user-defined categories
    ]
  },
  customType: {
    type: String,
    trim: true
  },
  fileURL: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  externalURL: {
    type: String
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  yearOfPaper: {
    type: Number,
    validate: {
      validator: function(value) {
        // Only required for CT Paper and End Sem Paper
        if (this.type === 'CT Paper' || this.type === 'End Sem Paper') {
          return value != null && value >= 2000 && value <= new Date().getFullYear();
        }
        return true;
      },
      message: 'Year of paper is required for exam papers and must be valid'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient searching and filtering
resourceSchema.index({ subject: 1, type: 1 });
resourceSchema.index({ uploader: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);