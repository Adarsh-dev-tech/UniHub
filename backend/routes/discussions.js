const express = require('express');
const DiscussionPost = require('../models/DiscussionPost');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/discussions/subject/:subjectId
// @desc    Get all discussion posts for a subject
// @access  Private
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const discussions = await DiscussionPost.find({ subject: req.params.subjectId })
      .populate('user', 'name')
      .populate('replies.user', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DiscussionPost.countDocuments({ subject: req.params.subjectId });

    res.json({
      discussions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/discussions/:id
// @desc    Get single discussion post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('user', 'name')
      .populate('replies.user', 'name')
      .populate('subject', 'subjectName subjectCode');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions
// @desc    Create a new discussion post
// @access  Private
router.post('/', [
  auth,
  body('subject').isMongoId(),
  body('title').isLength({ min: 5, max: 200 }).trim(),
  body('content').isLength({ min: 10, max: 5000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, title, content, tags } = req.body;

    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const discussion = new DiscussionPost({
      subject,
      user: req.user._id,
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : []
    });

    await discussion.save();
    await discussion.populate('user', 'name');

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discussions/:id/reply
// @desc    Add a reply to a discussion
// @access  Private
router.post('/:id/reply', [
  auth,
  body('content').isLength({ min: 5, max: 2000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const discussion = await DiscussionPost.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.isClosed) {
      return res.status(400).json({ message: 'Discussion is closed' });
    }

    const reply = {
      user: req.user._id,
      content
    };

    discussion.replies.push(reply);
    await discussion.save();

    await discussion.populate('replies.user', 'name');

    const newReply = discussion.replies[discussion.replies.length - 1];

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:id/like
// @desc    Like/unlike a discussion
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Remove like
      discussion.likes.splice(likeIndex, 1);
    } else {
      // Add like
      discussion.likes.push(req.user._id);
    }

    await discussion.save();

    res.json({
      message: 'Like status updated',
      likes: discussion.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/discussions/:discussionId/reply/:replyId/like
// @desc    Like/unlike a reply
// @access  Private
router.put('/:discussionId/reply/:replyId/like', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Remove like
      reply.likes.splice(likeIndex, 1);
    } else {
      // Add like
      reply.likes.push(req.user._id);
    }

    await discussion.save();

    res.json({
      message: 'Reply like status updated',
      likes: reply.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete a discussion
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user owns the discussion
    if (discussion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussion.deleteOne();

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;