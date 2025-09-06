const express = require('express');
const router = express.Router();
const verifyFirebase = require('../middleware/verifyFirebase');
const { store } = require('../data/store');

// GET /api/notifications - return unread notifications for user
router.get('/', verifyFirebase, (req, res) => {
  try {
    const userUid = req.user.uid;
    const userNotifications = store.notifications.filter(n => n.userUid === userUid);
    return res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/mark-read - mark notifications as read
router.post('/mark-read', verifyFirebase, (req, res) => {
  try {
    const { ids } = req.body;
    const userUid = req.user.uid;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids must be an array' });
    }

    // Mark notifications as read
    ids.forEach(id => {
      const notification = store.notifications.find(n => n.id === id && n.userUid === userUid);
      if (notification) {
        notification.read = true;
      }
    });

    return res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
