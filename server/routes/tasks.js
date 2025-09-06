const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');

// Apply Firebase auth middleware to all routes
router.use(verifyFirebase);

// GET /api/projects/:pid/tasks - List tasks for project
router.get('/:pid/tasks', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Support filtering by status, assignee, due date
  // TODO: Populate assignee info and attachment counts
  // TODO: Sort by created date, due date, or priority
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/projects/:pid/tasks - Create new task
router.post('/:pid/tasks', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Validate request body (title, description, assignee, dueDate)
  // TODO: Create task and update project task count
  // TODO: Update assignee's open task count if assigned
  // TODO: Return created task with populated assignee
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/projects/:pid/tasks/:tid - Update task
router.patch('/:pid/tasks/:tid', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Allow updates to title, description, status, assignee, dueDate
  // TODO: Handle status changes and update counters
  // TODO: Handle assignee changes and update user task counts
  // TODO: Set updatedAt timestamp
  // TODO: Return updated task
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/projects/:pid/tasks/:tid/attachments - Add attachment to task
router.patch('/:pid/tasks/:tid/attachments', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Process Cloudinary upload response from frontend
  // TODO: Add attachment object to task.attachments array
  // TODO: Include uploader info (req.userLocal)
  // TODO: Return updated task with all attachments
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/projects/:pid/tasks/:tid/comments - Add comment to task
router.post('/:pid/tasks/:tid/comments', (req, res) => {
  // TODO: Verify user is project member
  // TODO: Validate comment text in request body
  // TODO: Create comment with author info
  // TODO: Return created comment with populated author
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;
