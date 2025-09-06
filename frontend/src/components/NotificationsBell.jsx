import React, { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationsRead } from '../lib/api';
import { getAuth } from 'firebase/auth';

const NotificationsBell = ({ idToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!idToken) return;
    
    try {
      setLoading(true);
      const data = await fetchNotifications(idToken);
      setNotifications(data.filter(n => !n.read));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    if (!idToken || notificationIds.length === 0) return;
    
    try {
      await markNotificationsRead(notificationIds, idToken);
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.map(n => n.id);
    handleMarkAsRead(unreadIds);
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [idToken]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '0.5rem',
          color: 'var(--muted)',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--brand)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--muted)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '50%',
            height: '20px',
            width: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '0.5rem',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 50
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: '500', color: '#1f2937' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--brand)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--brand)'}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)' }}>No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: !notification.read ? '#eff6ff' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleMarkAsRead([notification.id])}
                  onMouseEnter={(e) => {
                    if (notification.read) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notification.read) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '0.25rem' }}>{notification.text}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {new Date(notification.ts).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--brand)',
                        borderRadius: '50%',
                        marginLeft: '0.5rem',
                        marginTop: '0.25rem',
                        flexShrink: 0
                      }}></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
