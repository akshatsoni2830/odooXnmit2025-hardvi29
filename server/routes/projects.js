const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');

// Apply Firebase auth middleware to all routes
router.use(verifyFirebase);

// GET /api/projects - List all projects for authenticated user
router.get('/', (req, res) => {
  // TODO: Fetch projects where user is a member
  // TODO: Include member counts, task counts, overdue counts
  // TODO: Sort by recent activity or name
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  // TODO: Validate request body (name, description)
  // TODO: Create project with authenticated user as owner
  // TODO: Add creator as first member with owner role
  // TODO: Return created project with member info
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/projects/:pid - Get single project details
router.get('/:pid', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Populate project with members and recent tasks
  // TODO: Include task statistics (total, by status, overdue)
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/projects/:pid - Update project details
router.patch('/:pid', (req, res) => {
  // TODO: Verify user has admin/owner permissions
  // TODO: Update allowed fields (name, description)
  // TODO: Return updated project
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/projects/:pid/members - Add member to project
router.post('/:pid/members', (req, res) => {
  // TODO: Verify user has admin/owner permissions
  // TODO: Validate email and role in request body
  // TODO: Find or invite user by email
  // TODO: Add to project members array
  // TODO: Return updated member list
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;
