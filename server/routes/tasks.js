const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyFirebase = require('../middleware/verifyFirebase');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Apply Firebase auth middleware to all routes
router.use(verifyFirebase);

// Helper function to check if user is project member
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { isValid: false, error: 'Project not found' };
  }
  
  const isMember = project.members.some(member => member.userId.toString() === userId.toString());
  if (!isMember) {
    return { isValid: false, error: 'Not a project member' };
  }
  
  return { isValid: true, project };
};

// GET /api/projects/:pid/tasks - List tasks for project
router.get('/:pid/tasks', async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.userLocal._id;

    // Check project membership
    const membershipCheck = await checkProjectMembership(pid, userId);
    if (!membershipCheck.isValid) {
      return res.status(403).json({ error: membershipCheck.error });
    }

    // Fetch tasks for project, sorted by creation date (newest first)
    const tasks = await Task.find({ projectId: pid })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/projects/:pid/tasks - Create new task
router.post('/:pid/tasks', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { pid } = req.params;
    const { title, description, assignee, dueDate } = req.body;
    const userId = req.userLocal._id;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Check project membership
    const membershipCheck = await checkProjectMembership(pid, userId);
    if (!membershipCheck.isValid) {
      return res.status(403).json({ error: membershipCheck.error });
    }

    await session.withTransaction(async () => {
      // Create the task
      const taskData = {
        projectId: pid,
        title: title.trim(),
        description: description || '',
        status: 'todo',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add assignee if provided and valid
      if (assignee) {
        const assigneeUser = await User.findById(assignee);
        if (!assigneeUser) {
          throw new Error('Invalid assignee');
        }
        taskData.assignee = assignee;
      }

      // Add due date if provided
      if (dueDate) {
        taskData.dueDate = new Date(dueDate);
      }

      const task = await Task.create([taskData], { session });

      // Update project total tasks count
      await Project.findByIdAndUpdate(
        pid,
        { $inc: { totalTasks: 1 } },
        { session }
      );

      // Update assignee open tasks count if assignee exists
      if (assignee) {
        await User.findByIdAndUpdate(
          assignee,
          { $inc: { openTasksCount: 1 } },
          { session }
        );
      }

      // Populate assignee info for response
      await task[0].populate('assignee', 'name email');
      
      res.status(201).json({ task: task[0] });
    });

  } catch (error) {
    console.error('Error creating task:', error);
    const errorMessage = error.message || 'Failed to create task';
    res.status(500).json({ error: errorMessage });
  } finally {
    await session.endSession();
  }
});

// PATCH /api/projects/:pid/tasks/:tid - Update task
router.patch('/:pid/tasks/:tid', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { pid, tid } = req.params;
    const { title, description, assignee, dueDate, status } = req.body;
    const userId = req.userLocal._id;

    // Check project membership
    const membershipCheck = await checkProjectMembership(pid, userId);
    if (!membershipCheck.isValid) {
      return res.status(403).json({ error: membershipCheck.error });
    }

    // Find the task
    const task = await Task.findOne({ _id: tid, projectId: pid });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await session.withTransaction(async () => {
      const updates = { updatedAt: new Date() };
      const oldAssignee = task.assignee;
      const oldStatus = task.status;

      // Update basic fields
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description;
      if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;

      // Handle assignee change
      if (assignee !== undefined) {
        if (assignee && assignee !== oldAssignee?.toString()) {
          const assigneeUser = await User.findById(assignee);
          if (!assigneeUser) {
            throw new Error('Invalid assignee');
          }
          updates.assignee = assignee;
          
          // Update counters for assignee change
          if (oldAssignee && oldStatus !== 'done') {
            await User.findByIdAndUpdate(oldAssignee, { $inc: { openTasksCount: -1 } }, { session });
          }
          if (oldStatus !== 'done') {
            await User.findByIdAndUpdate(assignee, { $inc: { openTasksCount: 1 } }, { session });
          }
        } else if (!assignee && oldAssignee) {
          updates.assignee = null;
          if (oldStatus !== 'done') {
            await User.findByIdAndUpdate(oldAssignee, { $inc: { openTasksCount: -1 } }, { session });
          }
        }
      }

      // Handle status change
      if (status !== undefined && status !== oldStatus) {
        updates.status = status;
        
        const currentAssignee = updates.assignee !== undefined ? updates.assignee : oldAssignee;
        
        if (currentAssignee) {
          if (status === 'done' && oldStatus !== 'done') {
            // Task completed - decrease open count
            await User.findByIdAndUpdate(currentAssignee, { $inc: { openTasksCount: -1 } }, { session });
          } else if (status !== 'done' && oldStatus === 'done') {
            // Task reopened - increase open count
            await User.findByIdAndUpdate(currentAssignee, { $inc: { openTasksCount: 1 } }, { session });
          }
        }
      }

      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        tid,
        updates,
        { new: true, session }
      ).populate('assignee', 'name email');

      res.json({ task: updatedTask });
    });

  } catch (error) {
    console.error('Error updating task:', error);
    const errorMessage = error.message || 'Failed to update task';
    res.status(500).json({ error: errorMessage });
  } finally {
    await session.endSession();
  }
});

// PATCH /api/projects/:pid/tasks/:tid/attachments - Add attachment to task
router.patch('/:pid/tasks/:tid/attachments', async (req, res) => {
  try {
    const { pid, tid } = req.params;
    const { attachment } = req.body;
    const userId = req.userLocal._id;

    // Validate attachment data
    if (!attachment || !attachment.url || !attachment.publicId) {
      return res.status(400).json({ error: 'Invalid attachment data' });
    }

    // Check project membership
    const membershipCheck = await checkProjectMembership(pid, userId);
    if (!membershipCheck.isValid) {
      return res.status(403).json({ error: membershipCheck.error });
    }

    // Find the task
    const task = await Task.findOne({ _id: tid, projectId: pid });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add attachment with uploader info
    const attachmentData = {
      url: attachment.url,
      publicId: attachment.publicId,
      name: attachment.name || 'Unknown',
      size: attachment.size || 0,
      mime: attachment.mime || 'application/octet-stream',
      uploaderId: userId,
      uploaderName: req.userLocal.name,
      uploadedAt: new Date()
    };

    const updatedTask = await Task.findByIdAndUpdate(
      tid,
      { 
        $push: { attachments: attachmentData },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).populate('assignee', 'name email');

    res.json({ task: updatedTask });

  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ error: 'Failed to add attachment' });
  }
});

// POST /api/projects/:pid/tasks/:tid/comments - Add comment to task
router.post('/:pid/tasks/:tid/comments', async (req, res) => {
  try {
    const { pid, tid } = req.params;
    const { text } = req.body;
    const userId = req.userLocal._id;

    // Validate comment text
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check project membership
    const membershipCheck = await checkProjectMembership(pid, userId);
    if (!membershipCheck.isValid) {
      return res.status(403).json({ error: membershipCheck.error });
    }

    // Verify task exists
    const task = await Task.findOne({ _id: tid, projectId: pid });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create comment
    const comment = await Comment.create({
      projectId: pid,
      taskId: tid,
      author: userId,
      text: text.trim(),
      createdAt: new Date()
    });

    // Populate author info
    await comment.populate('author', 'name email');

    res.status(201).json({ comment });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

module.exports = router;