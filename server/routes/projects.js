const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');

// In-memory projects store
const projects = [];

// GET /api/projects - get user's projects (protected)
router.get('/', verifyFirebase, (req, res) => {
  try {
    const userUid = req.user.uid;
    const userEmail = req.user.email;
    
    // Filter projects where user is owner OR member
    const userProjects = projects.filter(project => 
      project.owner === userUid || 
      project.members.includes(userEmail)
    );
    
    console.log(`Found ${userProjects.length} projects for user ${userEmail}`);
    return res.json(userProjects);
  } catch (error) {
    console.error('Error fetching projects:', error.stack);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - create project (protected)
router.post('/', verifyFirebase, (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const userUid = req.user.uid;
    const userEmail = req.user.email;

    const newProject = {
      id: Date.now(),
      name: name.trim(),
      description: description || '',
      owner: userUid,
      ownerEmail: userEmail,
      members: [userEmail],
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    
    console.log(`Created project "${newProject.name}" for user ${userEmail}`);
    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error.stack);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

module.exports = router;