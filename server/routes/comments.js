const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');
const { store, generateId, findProject, findTask, addNotification } = require('../data/store');

// POST /api/projects/:projectId/tasks/:taskId/comments - add comment
router.post('/:projectId/tasks/:taskId/comments', verifyFirebase, (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text, replyTo } = req.body;
    const userUid = req.user.uid;
    const userEmail = req.user.email || '';

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = findTask(taskId);
    if (!task || task.projectId !== projectId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is member
    const isMember = project.owner === userUid || 
      project.members.some(member => member.uid === userUid);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newComment = {
      id: generateId(),
      authorUid: userUid,
      authorEmail: userEmail,
      text: text.trim(),
      replyTo: replyTo || null,
      createdAt: new Date().toISOString()
    };

    task.comments.push(newComment);

    // Add notification for task assignee (if not the commenter)
    if (task.assignee && task.assignee !== userUid) {
      addNotification(task.assignee, 'comment_added', `New comment on task: "${task.title}"`, {
        projectId,
        taskId: task.id,
        commentId: newComment.id
      });
    }

    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
});

// GET /api/projects/:projectId/tasks/:taskId/comments - list comments
router.get('/:projectId/tasks/:taskId/comments', verifyFirebase, (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userUid = req.user.uid;

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = findTask(taskId);
    if (!task || task.projectId !== projectId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is member
    const isMember = project.owner === userUid || 
      project.members.some(member => member.uid === userUid);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(task.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;
