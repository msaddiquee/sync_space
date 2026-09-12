const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

// Generates an 8-character easy-to-share alphanumeric invite code
const generateInviteCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

const WorkspaceMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
    default: 'EDITOR'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    default: '',
    maxlength: 200
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => generateInviteCode()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [WorkspaceMemberSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);

