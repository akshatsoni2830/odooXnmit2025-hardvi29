// In-memory data store for SynergySphere prototype
// This will be replaced with a real database in production

const store = {
  projects: [],
  tasks: [],
  notifications: []
};

// Helper functions
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

const findProject = (projectId) => {
  return store.projects.find(p => p.id === projectId);
};

const findTask = (taskId) => {
  return store.tasks.find(t => t.id === taskId);
};

const addNotification = (userUid, type, text, meta = {}) => {
  const notification = {
    id: generateId(),
    userUid,
    type,
    text,
    meta,
    read: false,
    ts: new Date().toISOString()
  };
  store.notifications.push(notification);
  return notification;
};

module.exports = {
  store,
  generateId,
  findProject,
  findTask,
  addNotification
};
