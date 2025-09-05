const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    branch: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    }
  },
  uploadedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  isSetupComplete: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);