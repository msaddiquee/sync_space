const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Predefined vibrant colors for collaborator cursors and avatars
const USER_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ea580c', // Orange
  '#16a34a', // Green
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#dc2626'  // Red
];

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatarColor: {
    type: String,
    default: () => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
  },
  avatarUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

