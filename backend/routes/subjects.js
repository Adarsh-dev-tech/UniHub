const express = require('express');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get subjects for user's branch, year, and semester
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isSetupComplete) {
      return res.status(400).json({ message: 'Please complete your profile setup first' });
    }

    const { branch, year, semester } = req.user.profile;
    
    const subjects = await Subject.find({
      branch,
      year,
      semester,
      isActive: true
    }).sort({ subjectName: 1 });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/:subjectCode
// @desc    Get subject by code
// @access  Private
router.get('/:subjectCode', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      subjectCode: req.params.subjectCode.toUpperCase(),
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject (admin functionality)
// @access  Private
router.post('/', [
  auth,
  body('subjectName').isLength({ min: 2 }).trim(),
  body('subjectCode').isLength({ min: 2 }).trim(),
  body('branch').isLength({ min: 2 }).trim(),
  body('year').isInt({ min: 1, max: 6 }),
  body('semester').isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjectName, subjectCode, professorName, branch, year, semester, description, credits } = req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    const subject = new Subject({
      subjectName,
      subjectCode: subjectCode.toUpperCase(),
      professorName,
      branch,
      year,
      semester,
      description,
      credits
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/search/:query
// @desc    Search subjects by name or code
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const regex = new RegExp(query, 'i');

    const subjects = await Subject.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { subjectName: regex },
            { subjectCode: regex },
            { professorName: regex }
          ]
        }
      ]
    }).limit(20);

    res.json(subjects);
  } catch (error) {
    console.error('Search subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;