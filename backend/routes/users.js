const express = require('express');
const User = require('../models/User');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('uploadedResources', 'title type createdAt')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (profile) updateData.profile = profile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user contribution stats
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const totalUploads = await Resource.countDocuments({ uploader: userId, isVisible: true });
    const totalDownloads = await Resource.aggregate([
      { $match: { uploader: mongoose.Types.ObjectId(userId), isVisible: true } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    const resourcesByType = await Resource.aggregate([
      { $match: { uploader: mongoose.Types.ObjectId(userId), isVisible: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUploads,
      totalDownloads: totalDownloads[0]?.total || 0,
      resourcesByType
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;