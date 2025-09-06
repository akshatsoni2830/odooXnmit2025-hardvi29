const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'done'],
    default: 'todo'
  },
  dueDate: {
    type: Date
  },
  attachments: [{
    url: String,
    publicId: String,
    name: String,
    size: Number,
    mime: String,
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploaderName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
taskSchema.index({ projectId: 1 });
taskSchema.index({ assignee: 1 });

module.exports = mongoose.model('Task', taskSchema);
