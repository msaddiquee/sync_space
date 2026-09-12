const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_syncspace_development_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    // Automatically create a default personal workspace for the new user
    const defaultWorkspace = await Workspace.create({
      name: `${user.name}'s Workspace`,
      description: 'Your default collaborative workspace',
      owner: user._id,
      members: [{ user: user._id, role: 'OWNER' }]
    });

    // Create starter documents in the default workspace
    const starterDoc = await Document.create({
      title: 'Getting Started with SyncSpace',
      icon: '🚀',
      type: 'DOC',
      workspace: defaultWorkspace._id,
      createdBy: user._id
    });

    const starterCanvas = await Document.create({
      title: 'Brainstorming Board',
      icon: '🎨',
      type: 'CANVAS',
      workspace: defaultWorkspace._id,
      createdBy: user._id
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor
      },
      defaultWorkspaceId: defaultWorkspace._id,
      starterDocId: starterDoc._id
    });
  } catch (err) {
    console.error('[Auth Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

