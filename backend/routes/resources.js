const express = require('express');
const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get resources for a subject
router.get('/subject/:subjectCode', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      subjectCode: req.params.subjectCode.toUpperCase() 
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const resources = await Resource.find({ subject: subject._id })
      .populate('uploader', 'name')
      .sort({ createdAt: -1 });

    // Group resources by type
    const groupedResources = resources.reduce((acc, resource) => {
      const type = resource.customType || resource.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(resource);
      return acc;
    }, {});

    res.json(groupedResources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error while fetching resources' });
  }
});

// Upload resource
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, type, customType, subjectCode, yearOfPaper, tags, externalURL } = req.body;

    const subject = await Subject.findOne({ 
      subjectCode: subjectCode.toUpperCase() 
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const resourceData = {
      title,
      type,
      subject: subject._id,
      uploader: req.user.id
    };

    // Handle custom type
    if (type === 'Custom' && customType) {
      resourceData.customType = customType;
    }

    // Handle year of paper for exam papers
    if ((type === 'CT Paper' || type === 'End Sem Paper') && yearOfPaper) {
      resourceData.yearOfPaper = parseInt(yearOfPaper);
    }

    // Handle tags
    if (tags) {
      resourceData.tags = tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    // Handle file upload or external URL
    if (req.file) {
      resourceData.fileURL = `/uploads/${req.file.filename}`;
      resourceData.fileName = req.file.originalname;
      resourceData.fileSize = req.file.size;
      resourceData.fileType = req.file.mimetype;
    } else if (externalURL) {
      resourceData.externalURL = externalURL;
    } else {
      return res.status(400).json({ message: 'Either file or external URL is required' });
    }

    const resource = new Resource(resourceData);
    await resource.save();

    // Add resource to user's uploaded resources
    await User.findByIdAndUpdate(req.user.id, {
      $push: { uploadedResources: resource._id }
    });

    const populatedResource = await Resource.findById(resource._id)
      .populate('uploader', 'name');

    res.status(201).json(populatedResource);
  } catch (error) {
    console.error('Upload resource error:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Server error while uploading resource' });
  }
});

// Download resource
router.get('/download/:resourceId', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.fileURL) {
      return res.status(400).json({ message: 'No file available for download' });
    }

    // Increment download count
    await Resource.findByIdAndUpdate(req.params.resourceId, {
      $inc: { downloads: 1 }
    });

    const filePath = path.join(__dirname, '..', resource.fileURL);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, resource.fileName);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: 'Server error while downloading resource' });
  }
});

// View/preview resource
router.get('/view/:resourceId', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId)
      .populate('uploader', 'name');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.fileURL) {
      const filePath = path.join(__dirname, '..', resource.fileURL);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Set appropriate headers for viewing
      const ext = path.extname(resource.fileName).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': 'inline'
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.json(resource);
    }
  } catch (error) {
    console.error('View resource error:', error);
    res.status(500).json({ message: 'Server error while viewing resource' });
  }
});

// Search resources
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const resources = await Resource.find({
      $text: { $search: query }
    })
    .populate('uploader', 'name')
    .populate('subject', 'subjectName subjectCode')
    .limit(50);

    res.json(resources);
  } catch (error) {
    console.error('Search resources error:', error);
    res.status(500).json({ message: 'Server error while searching resources' });
  }
});

// Get resource details
router.get('/:resourceId', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId)
      .populate('uploader', 'name')
      .populate('subject', 'subjectName subjectCode');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error while fetching resource' });
  }
});

module.exports = router;