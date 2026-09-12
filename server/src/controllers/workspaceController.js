const Workspace = require('../models/Workspace');
const Document = require('../models/Document');

// @desc    Get all workspaces the current user is a member or owner of
// @route   GET /api/workspaces
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id
    }).populate('owner', 'name email avatarColor');

    res.json({ success: true, count: workspaces.length, workspaces });
  } catch (err) {
    console.error('[Workspace Error]', err);
    res.status(500).json({ success: false, message: 'Server error fetching workspaces' });
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'OWNER' }]
    });

    // Create a starter document
    const starterDoc = await Document.create({
      title: 'Welcome to ' + name,
      icon: '✨',
      type: 'DOC',
      workspace: workspace._id,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      workspace,
      starterDocId: starterDoc._id
    });
  } catch (err) {
    console.error('[Workspace Error]', err);
    res.status(500).json({ success: false, message: 'Server error creating workspace' });
  }
};

// @desc    Join a workspace using an invite code
// @route   POST /api/workspaces/join
exports.joinWorkspace = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Invite code is required' });
    }

    const workspace = await Workspace.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Invalid invite code. No workspace found.' });
    }

    // Check if already a member
    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.json({
        success: true,
        message: 'You are already a member of this workspace',
        workspace
      });
    }

    workspace.members.push({ user: req.user._id, role: 'EDITOR' });
    await workspace.save();

    res.json({
      success: true,
      message: `Successfully joined ${workspace.name}!`,
      workspace
    });
  } catch (err) {
    console.error('[Join Workspace Error]', err);
    res.status(500).json({ success: false, message: 'Server error joining workspace' });
  }
};

// @desc    Get workspace details by ID
// @route   GET /api/workspaces/:id
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'name email avatarColor')
      .populate('owner', 'name email avatarColor');

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You do not have access to this workspace' });
    }

    res.json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching workspace' });
  }
};

