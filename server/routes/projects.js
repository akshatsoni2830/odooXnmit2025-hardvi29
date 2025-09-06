// server/routes/projects.js
// Real implementation for Projects endpoints.
// - Protects endpoints with verifyFirebase middleware
// - Lists projects where user is a member, creates projects, shows detail,
//   updates projects (membership required), and adds members by email.

const express = require('express');
const mongoose = require('mongoose');
const verifyFirebase = require('../middleware/verifyFirebase');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

// Helper: check membership
function isMember(project, userId) {
  if (!project || !project.members) return false;
  return project.members.some(m => String(m.userId) === String(userId));
}

// GET /api/projects
// Return projects where current user is a member
router.get('/', verifyFirebase, async (req, res) => {
  try {
    const userId = req.userLocal._id;
    // Find projects where members array contains this userId
    const projects = await Project.find({ 'members.userId': userId })
      .select('-__v')
      .lean()
      .exec();

    return res.json({ projects });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return res.status(500).json({ error: 'Failed to list projects' });
  }
});

// POST /api/projects
// Create a project and add the current user as a member (owner)
router.post('/', verifyFirebase, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const owner = req.userLocal;
    const newProject = new Project({
      name: name.trim(),
      description: description || '',
      createdBy: owner._id,
      members: [{
        userId: owner._id,
        role: 'owner',
        name: owner.name || '',
        email: owner.email || ''
      }],
      totalTasks: 0,
      overdueCount: 0,
      createdAt: new Date()
    });

    const saved = await newProject.save();
    return res.status(201).json({ project: saved });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:pid
// Return project detail (only if user is member)
router.get('/:pid', verifyFirebase, async (req, res) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }

    const project = await Project.findById(pid).select('-__v').lean().exec();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const userId = req.userLocal._id;
    if (!isMember(project, userId)) {
      return res.status(403).json({ error: 'Access denied: not a project member' });
    }

    return res.json({ project });
  } catch (err) {
    console.error('GET /api/projects/:pid error:', err);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PATCH /api/projects/:pid
// Update project meta (only members can update). Only name/description changes here.
router.patch('/:pid', verifyFirebase, async (req, res) => {
  try {
    const { pid } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }

    const project = await Project.findById(pid).exec();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const userId = req.userLocal._id;
    if (!isMember(project, userId)) {
      return res.status(403).json({ error: 'Access denied: not a project member' });
    }

    let changed = false;
    if (typeof name === 'string' && name.trim().length > 0 && name.trim() !== project.name) {
      project.name = name.trim();
      changed = true;
    }
    if (typeof description === 'string' && description !== project.description) {
      project.description = description;
      changed = true;
    }

    if (changed) {
      await project.save();
    }

    return res.json({ project });
  } catch (err) {
    console.error('PATCH /api/projects/:pid error:', err);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// POST /api/projects/:pid/members
// Add a member to a project by email. Only project members can add others.
router.post('/:pid/members', verifyFirebase, async (req, res) => {
  try {
    const { pid } = req.params;
    const { email, role = 'member' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Member email is required' });
    }

    const project = await Project.findById(pid).exec();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const userId = req.userLocal._id;
    if (!isMember(project, userId)) {
      return res.status(403).json({ error: 'Access denied: not a project member' });
    }

    // Find the local user by email
    const userToAdd = await User.findOne({ email: email.trim().toLowerCase() }).exec();
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found (must be registered first)' });
    }

    // Prevent duplicate members
    const already = project.members.some(m => String(m.userId) === String(userToAdd._id));
    if (already) {
      return res.status(400).json({ error: 'User is already a project member' });
    }

    // Add member
    project.members.push({
      userId: userToAdd._id,
      role,
      name: userToAdd.name || '',
      email: userToAdd.email || ''
    });

    await project.save();
    return res.status(201).json({ project });
  } catch (err) {
    console.error('POST /api/projects/:pid/members error:', err);
    return res.status(500).json({ error: 'Failed to add project member' });
  }
});

module.exports = router;
