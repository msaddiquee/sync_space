const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String,
    default: '📄' // Default emoji icon
  },
  type: {
    type: String,
    enum: ['DOC', 'CANVAS'],
    default: 'DOC'
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  // Flexible storage for blocks (for DOC) or canvas elements (for CANVAS)
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: function() {
      if (this.type === 'CANVAS') {
        return {
          elements: [
            {
              id: 'note-1',
              type: 'sticky',
              x: 100,
              y: 120,
              width: 220,
              height: 180,
              color: '#fef08a', // Light yellow
              text: '💡 Project Kickoff!\n- Brainstorm ideas\n- Assign features'
            },
            {
              id: 'note-2',
              type: 'sticky',
              x: 360,
              y: 120,
              width: 220,
              height: 180,
              color: '#bae6fd', // Light blue
              text: '🚀 Real-time Collaboration\n- WebSockets\n- Live Cursors'
            }
          ]
        };
      }
      return {
        blocks: [
          { id: 'b-1', type: 'h1', text: 'Welcome to your new document' },
          { id: 'b-2', type: 'paragraph', text: 'Type anywhere to start editing. Real-time changes sync immediately across all connected teammates.' },
          { id: 'b-3', type: 'todo', text: 'Create workspace pages', checked: true },
          { id: 'b-4', type: 'todo', text: 'Invite teammates via invite code', checked: false }
        ]
      };
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema);

