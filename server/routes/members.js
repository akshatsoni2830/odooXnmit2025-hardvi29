const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');
const { store, generateId, findProject, addNotification } = require('../data/store');

// POST /api/projects/:projectId/members - add member by email
router.post('/:projectId/members', verifyFirebase, (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'member' } = req.body;
    const userUid = req.user.uid;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner !== userUid) {
      return res.status(403).json({ error: 'Only project owner can add members' });
    }

    // Check if member already exists
    const existingMember = project.members.find(member => 
      member.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingMember) {
      return res.status(400).json({ error: 'Member already exists' });
    }

    // Add new member (in real app, would verify email exists in system)
    const newMember = {
      uid: generateId(), // In real app, would be actual user UID
      email: email.trim().toLowerCase(),
      role: role
    };

    project.members.push(newMember);

    // Add notification for new member
    addNotification(newMember.uid, 'member_added', `You were added to project "${project.name}"`, {
      projectId: project.id
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ error: 'Failed to add member' });
  }
});

// DELETE /api/projects/:projectId/members/:email - remove member (owner only)
router.delete('/:projectId/members/:email', verifyFirebase, (req, res) => {
  try {
    const { projectId, email } = req.params;
    const userUid = req.user.uid;

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner !== userUid) {
      return res.status(403).json({ error: 'Only project owner can remove members' });
    }

    // Find and remove member
    const memberIndex = project.members.findIndex(member => 
      member.email.toLowerCase() === email.toLowerCase()
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const removedMember = project.members[memberIndex];
    project.members.splice(memberIndex, 1);

    // Add notification for removed member
    addNotification(removedMember.uid, 'member_removed', `You were removed from project "${project.name}"`, {
      projectId: project.id
    });

    return res.json(project);
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
