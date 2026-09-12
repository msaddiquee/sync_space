const Document = require('../models/Document');
const Workspace = require('../models/Workspace');

// @desc    Get all documents for a workspace
// @route   GET /api/workspaces/:workspaceId/documents
exports.getWorkspaceDocuments = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: 'Not authorized to view documents in this workspace' });
    }

    const documents = await Document.find({ workspace: workspaceId })
      .select('title icon type parent workspace createdBy updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    console.error('[Document Fetch Error]', err);
    res.status(500).json({ success: false, message: 'Server error fetching documents' });
  }
};

// @desc    Create a new document or canvas board
// @route   POST /api/documents
exports.createDocument = async (req, res) => {
  try {
    const { title, icon, type, workspaceId, parentId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    // Verify membership
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: 'You are not a member of this workspace' });
    }

    const docType = type === 'CANVAS' ? 'CANVAS' : 'DOC';
    const docIcon = icon || (docType === 'CANVAS' ? '🎨' : '📄');

    const document = await Document.create({
      title: title || 'Untitled',
      icon: docIcon,
      type: docType,
      workspace: workspaceId,
      parent: parentId || null,
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    });

    res.status(201).json({ success: true, document });
  } catch (err) {
    console.error('[Document Create Error]', err);
    res.status(500).json({ success: false, message: 'Server error creating document' });
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email avatarColor')
      .populate('lastEditedBy', 'name email avatarColor');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check workspace membership
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this document' });
    }

    res.json({ success: true, document });
  } catch (err) {
    console.error('[Document Fetch Error]', err);
    res.status(500).json({ success: false, message: 'Server error fetching document' });
  }
};

// @desc    Update document metadata or content
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
  try {
    const { title, icon, content, isPublished } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Verify workspace membership
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this document' });
    }

    if (title !== undefined) document.title = title;
    if (icon !== undefined) document.icon = icon;
    if (content !== undefined) document.content = content;
    if (isPublished !== undefined) document.isPublished = isPublished;

    document.lastEditedBy = req.user._id;
    await document.save();

    res.json({ success: true, document });
  } catch (err) {
    console.error('[Document Update Error]', err);
    res.status(500).json({ success: false, message: 'Server error updating document' });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('[Document Delete Error]', err);
    res.status(500).json({ success: false, message: 'Server error deleting document' });
  }
};

