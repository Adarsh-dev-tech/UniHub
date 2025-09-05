const express = require('express');
const Rating = require('../models/Rating');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const router = express.Router();

// Get ratings for a resource
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ resource: req.params.resourceId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
});

// Add or update rating
router.post('/', auth, async (req, res) => {
  try {
    const { resourceId, value, comment } = req.body;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user already rated this resource
    let rating = await Rating.findOne({
      user: req.user.id,
      resource: resourceId
    });

    if (rating) {
      // Update existing rating
      rating.value = value;
      rating.comment = comment;
      await rating.save();
    } else {
      // Create new rating
      rating = new Rating({
        user: req.user.id,
        resource: resourceId,
        value,
        comment
      });
      await rating.save();
    }

    // Recalculate average rating for the resource
    const allRatings = await Rating.find({ resource: resourceId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;
    
    await Resource.findByIdAndUpdate(resourceId, {
      averageRating: avgRating,
      totalRatings: allRatings.length
    });

    const populatedRating = await Rating.findById(rating._id)
      .populate('user', 'name');

    res.json(populatedRating);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error while adding rating' });
  }
});

// Delete rating
router.delete('/:ratingId', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns this rating
    if (rating.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    const resourceId = rating.resource;
    await Rating.findByIdAndDelete(req.params.ratingId);

    // Recalculate average rating for the resource
    const allRatings = await Rating.find({ resource: resourceId });
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length 
      : 0;
    
    await Resource.findByIdAndUpdate(resourceId, {
      averageRating: avgRating,
      totalRatings: allRatings.length
    });

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error while deleting rating' });
  }
});

module.exports = router;