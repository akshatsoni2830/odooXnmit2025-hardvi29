require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Check if demo data already exists
    const existingDemo = await Project.findOne({ name: 'synergysphere-demo' });
    
    if (existingDemo) {
      console.log('Demo data already exists, skipping seed');
      return;
    }

    // Create demo project (without real users for now)
    const demoProject = await Project.create({
      name: 'synergysphere-demo',
      description: 'Demo project for SynergySphere platform',
      createdBy: new mongoose.Types.ObjectId(), // Placeholder ObjectId
      members: [],
      totalTasks: 0,
      overdueCount: 0
    });

    console.log('Demo project created successfully');
    console.log('Seed completed - demo data is ready');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
