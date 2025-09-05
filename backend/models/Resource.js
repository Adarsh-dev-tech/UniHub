const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
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
    type: String,
    trim: true
  },
  externalURL: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  yearOfPaper: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear() + 1
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
  views: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can implement moderation later
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
resourceSchema.index({ subject: 1, type: 1 });
resourceSchema.index({ uploader: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ averageRating: -1 });
resourceSchema.index({ createdAt: -1 });

// Virtual for getting the actual type (custom or predefined)
resourceSchema.virtual('actualType').get(function() {
  return this.type === 'Custom' ? this.customType : this.type;
});

module.exports = mongoose.model('Resource', resourceSchema);