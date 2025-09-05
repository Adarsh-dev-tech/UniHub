const express = require('express');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get subjects for user's branch, year, and semester
router.get('/my-subjects', auth, async (req, res) => {
  try {
    if (!req.user.isProfileComplete) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }

    const { branch, year, semester } = req.user.profile;
    
    const subjects = await Subject.find({
      branch,
      year,
      semester
    }).sort({ subjectName: 1 });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// Get subject by code
router.get('/:subjectCode', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      subjectCode: req.params.subjectCode.toUpperCase() 
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error while fetching subject' });
  }
});

// Create new subject (admin functionality)
router.post('/', auth, async (req, res) => {
  try {
    const { subjectName, subjectCode, professorName, branch, year, semester } = req.body;

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
      semester
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error while creating subject' });
  }
});

// Search subjects
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const subjects = await Subject.find({
      $or: [
        { subjectName: { $regex: query, $options: 'i' } },
        { subjectCode: { $regex: query, $options: 'i' } },
        { professorName: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json(subjects);
  } catch (error) {
    console.error('Search subjects error:', error);
    res.status(500).json({ message: 'Server error while searching subjects' });
  }
});

module.exports = router;