const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');
const { store, generateId, findProject, findTask, addNotification } = require('../data/store');

// GET /api/projects/:projectId/tasks - return tasks for project
router.get('/:projectId/tasks', verifyFirebase, (req, res) => {
  try {
    const { projectId } = req.params;
    const userUid = req.user.uid;

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.owner === userUid || 
      project.members.some(member => member.uid === userUid);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const projectTasks = store.tasks.filter(task => task.projectId === projectId);
    return res.json(projectTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/projects/:projectId/tasks - create task
router.post('/:projectId/tasks', verifyFirebase, (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignee, dueDate, priority = 'Medium' } = req.body;
    const userUid = req.user.uid;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const project = findProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.owner === userUid || 
      project.members.some(member => member.uid === userUid);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newTask = {
      id: generateId(),
      projectId,
      title: title.trim(),
      description: description || '',
      assignee: assignee || userUid,
      dueDate: dueDate || null,
      status: 'To-Do',
      priority: priority,
      comments: [],
      createdAt: new Date().toISOString(),
      createdBy: userUid
    };

    store.tasks.push(newTask);

    // Add notification for assignee
    if (assignee && assignee !== userUid) {
      addNotification(assignee, 'task_assigned', `New task assigned: "${newTask.title}"`, {
        projectId,
        taskId: newTask.id
      });
    }

    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/projects/:projectId/tasks/:taskId - update task
router.put('/:projectId/tasks/:taskId', verifyFirebase, (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, assignee, dueDate, status, priority } = req.body;
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

    // Update task fields
    if (title && title.trim()) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (assignee) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;

    // Add notification for assignee change
    if (assignee && assignee !== userUid && assignee !== task.assignee) {
      addNotification(assignee, 'task_assigned', `Task assigned to you: "${task.title}"`, {
        projectId,
        taskId: task.id
      });
    }

    return res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/projects/:projectId/tasks/:taskId - delete task
router.delete('/:projectId/tasks/:taskId', verifyFirebase, (req, res) => {
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

    // Remove task
    const taskIndex = store.tasks.findIndex(t => t.id === taskId);
    store.tasks.splice(taskIndex, 1);

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;