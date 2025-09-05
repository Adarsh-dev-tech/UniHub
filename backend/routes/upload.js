const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PPT, DOC, TXT, and image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @route   POST /api/upload/file
// @desc    Upload a file
// @access  Private
router.post('/file', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      fileName: req.file.originalname,
      fileURL: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id
    };

    res.json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   GET /api/upload/file/:filename
// @desc    Serve uploaded files
// @access  Private
router.get('/file/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/upload/view/:filename
// @desc    View uploaded files (for preview)
// @access  Private
router.get('/view/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers for file viewing
    res.setHeader('Content-Type', 'application/pdf'); // Default to PDF, adjust based on file type
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('File view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: 'File upload error' });
});

module.exports = router;