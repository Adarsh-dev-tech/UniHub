const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/resources/subject/:subjectId
// @desc    Get all resources for a subject
// @access  Private
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      subject: req.params.subjectId,
      isVisible: true,
      isApproved: true
    })
    .populate('uploader', 'name')
    .sort({ createdAt: -1 });

    // Group resources by type
    const groupedResources = {};
    resources.forEach(resource => {
      const type = resource.type === 'Custom' ? resource.customType : resource.type;
      if (!groupedResources[type]) {
        groupedResources[type] = [];
      }
      groupedResources[type].push(resource);
    });

    // Sort CT Papers and End Sem Papers by year
    ['CT Paper', 'End Sem Paper'].forEach(type => {
      if (groupedResources[type]) {
        const groupedByYear = {};
        groupedResources[type].forEach(resource => {
          const year = resource.yearOfPaper || 'Unknown';
          if (!groupedByYear[year]) {
            groupedByYear[year] = [];
          }
          groupedByYear[year].push(resource);
        });
        groupedResources[type] = groupedByYear;
      }
    });

    res.json(groupedResources);
  } catch (error) {
    console.error('Get subject resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploader', 'name')
      .populate('subject', 'subjectName subjectCode');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Create a new resource
// @access  Private
router.post('/', [
  auth,
  body('title').isLength({ min: 2 }).trim(),
  body('type').isIn(['Course Plan', 'CT Paper', 'End Sem Paper', 'PPT', 'Class Notes', 'Reference Book', 'YouTube Link', 'Custom']),
  body('subject').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      type,
      customType,
      fileURL,
      externalURL,
      fileName,
      fileSize,
      fileType,
      subject,
      yearOfPaper,
      tags,
      description
    } = req.body;

    // Validate custom type if type is Custom
    if (type === 'Custom' && !customType) {
      return res.status(400).json({ message: 'Custom type is required when type is Custom' });
    }

    // Validate year for exam papers
    if (['CT Paper', 'End Sem Paper'].includes(type) && !yearOfPaper) {
      return res.status(400).json({ message: 'Year of paper is required for exam papers' });
    }

    // Validate URL for YouTube links
    if (type === 'YouTube Link' && !externalURL) {
      return res.status(400).json({ message: 'External URL is required for YouTube links' });
    }

    // Validate file for other types
    if (type !== 'YouTube Link' && !fileURL) {
      return res.status(400).json({ message: 'File is required for this resource type' });
    }

    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const resource = new Resource({
      title,
      type,
      customType: type === 'Custom' ? customType : undefined,
      fileURL,
      externalURL,
      fileName,
      fileSize,
      fileType,
      subject,
      uploader: req.user._id,
      yearOfPaper,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      description
    });

    await resource.save();

    // Add resource to user's uploaded resources
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedResources: resource._id }
    });

    await resource.populate('uploader', 'name');
    await resource.populate('subject', 'subjectName subjectCode');

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id/download
// @desc    Increment download count
// @access  Private
router.put('/:id/download', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Download count updated' });
  } catch (error) {
    console.error('Update download count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/search/:query
// @desc    Search resources
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const regex = new RegExp(query, 'i');

    const resources = await Resource.find({
      $and: [
        { isVisible: true, isApproved: true },
        {
          $or: [
            { title: regex },
            { tags: { $in: [regex] } },
            { description: regex }
          ]
        }
      ]
    })
    .populate('uploader', 'name')
    .populate('subject', 'subjectName subjectCode')
    .limit(50)
    .sort({ averageRating: -1, createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error('Search resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;