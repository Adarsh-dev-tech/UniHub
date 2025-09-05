const express = require('express');
const Rating = require('../models/Rating');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Create or update a rating
// @access  Private
router.post('/', [
  auth,
  body('resource').isMongoId(),
  body('value').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resource, value, comment } = req.body;

    // Check if resource exists
    const resourceExists = await Resource.findById(resource);
    if (!resourceExists) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user already rated this resource
    let rating = await Rating.findOne({ user: req.user._id, resource });

    if (rating) {
      // Update existing rating
      const oldValue = rating.value;
      rating.value = value;
      rating.comment = comment;
      await rating.save();

      // Update resource average rating
      await updateResourceRating(resource, value, oldValue, false);
    } else {
      // Create new rating
      rating = new Rating({
        user: req.user._id,
        resource,
        value,
        comment
      });
      await rating.save();

      // Update resource average rating
      await updateResourceRating(resource, value, 0, true);
    }

    await rating.populate('user', 'name');

    res.json({
      message: 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings/resource/:resourceId
// @desc    Get all ratings for a resource
// @access  Private
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ resource: req.params.resourceId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings/user/:resourceId
// @desc    Get user's rating for a resource
// @access  Private
router.get('/user/:resourceId', auth, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      user: req.user._id,
      resource: req.params.resourceId
    });

    res.json(rating);
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/ratings/:id
// @desc    Delete a rating
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns the rating
    if (rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await rating.deleteOne();

    // Update resource average rating
    await updateResourceRating(rating.resource, 0, rating.value, false, true);

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update resource average rating
async function updateResourceRating(resourceId, newValue, oldValue, isNew, isDelete = false) {
  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) return;

    let totalRatings = resource.totalRatings;
    let totalScore = resource.averageRating * totalRatings;

    if (isNew) {
      totalRatings += 1;
      totalScore += newValue;
    } else if (isDelete) {
      totalRatings -= 1;
      totalScore -= oldValue;
    } else {
      // Update existing rating
      totalScore = totalScore - oldValue + newValue;
    }

    const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

    await Resource.findByIdAndUpdate(resourceId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings
    });
  } catch (error) {
    console.error('Update resource rating error:', error);
  }
}

module.exports = router;