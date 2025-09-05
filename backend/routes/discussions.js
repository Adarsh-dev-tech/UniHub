const express = require('express');
const DiscussionPost = require('../models/DiscussionPost');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get discussions for a subject
router.get('/subject/:subjectCode', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      subjectCode: req.params.subjectCode.toUpperCase() 
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const discussions = await DiscussionPost.find({ subject: subject._id })
      .populate('user', 'name')
      .populate('replies.user', 'name')
      .sort({ createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ message: 'Server error while fetching discussions' });
  }
});

// Create new discussion post
router.post('/', auth, async (req, res) => {
  try {
    const { subjectCode, title, content } = req.body;

    const subject = await Subject.findOne({ 
      subjectCode: subjectCode.toUpperCase() 
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const discussion = new DiscussionPost({
      subject: subject._id,
      user: req.user.id,
      title,
      content
    });

    await discussion.save();

    const populatedDiscussion = await DiscussionPost.findById(discussion._id)
      .populate('user', 'name')
      .populate('replies.user', 'name');

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ message: 'Server error while creating discussion' });
  }
});

// Get single discussion with replies
router.get('/:discussionId', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.discussionId)
      .populate('user', 'name')
      .populate('replies.user', 'name')
      .populate('subject', 'subjectName subjectCode');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment views
    await DiscussionPost.findByIdAndUpdate(req.params.discussionId, {
      $inc: { views: 1 }
    });

    res.json(discussion);
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ message: 'Server error while fetching discussion' });
  }
});

// Add reply to discussion
router.post('/:discussionId/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const discussion = await DiscussionPost.findById(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = {
      user: req.user.id,
      content
    };

    discussion.replies.push(reply);
    await discussion.save();

    const updatedDiscussion = await DiscussionPost.findById(req.params.discussionId)
      .populate('user', 'name')
      .populate('replies.user', 'name');

    res.json(updatedDiscussion);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error while adding reply' });
  }
});

// Mark discussion as resolved
router.put('/:discussionId/resolve', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Only the author can mark as resolved
    if (discussion.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to resolve this discussion' });
    }

    discussion.isResolved = !discussion.isResolved;
    await discussion.save();

    res.json({ message: `Discussion ${discussion.isResolved ? 'marked as resolved' : 'reopened'}` });
  } catch (error) {
    console.error('Resolve discussion error:', error);
    res.status(500).json({ message: 'Server error while resolving discussion' });
  }
});

// Delete discussion
router.delete('/:discussionId', auth, async (req, res) => {
  try {
    const discussion = await DiscussionPost.findById(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Only the author can delete
    if (discussion.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await DiscussionPost.findByIdAndDelete(req.params.discussionId);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ message: 'Server error while deleting discussion' });
  }
});

module.exports = router;