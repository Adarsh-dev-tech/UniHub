const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const discussionPostSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  replies: [discussionReplySchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
discussionPostSchema.index({ subject: 1, createdAt: -1 });
discussionPostSchema.index({ user: 1 });
discussionPostSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('DiscussionPost', discussionPostSchema);