import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, fetchNotifications } from '../lib/api';
import { getAuth } from 'firebase/auth';
import NotificationsBell from '../components/NotificationsBell';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      const token = await currentUser.getIdToken();
      setIdToken(token);

      const [projectsData, notificationsData] = await Promise.all([
        fetchProjects(token),
        fetchNotifications(token)
      ]);

      setProjects(projectsData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const recentProjects = projects.slice(0, 3);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div>
      {/* Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand">SynergySphere</div>
          <div className="nav-buttons">
            <NotificationsBell idToken={idToken} />
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Welcome, {user?.displayName || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Welcome Section */}
        <div className="hero" style={{ padding: '2rem 0', textAlign: 'left' }}>
          <div className="hero-container">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'none', color: '#1f2937' }}>
              Welcome back, {user?.displayName || 'User'}!
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>
              Here's what's happening with your projects today.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats">
          <div className="stats-container">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <div className="stat-number">{projects.length}</div>
                <div className="stat-label">Total Projects</div>
              </div>

              <div className="stat-card">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div className="stat-number">
                  {projects.reduce((acc, project) => acc + (project.tasks?.filter(t => t.status === 'Done').length || 0), 0)}
                </div>
                <div className="stat-label">Completed Tasks</div>
              </div>

              <div className="stat-card">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <div className="stat-number">
                  {projects.reduce((acc, project) => acc + (project.tasks?.filter(t => t.status === 'In Progress').length || 0), 0)}
                </div>
                <div className="stat-label">In Progress</div>
              </div>

              <div className="stat-card">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <div className="stat-number">{unreadNotifications.length}</div>
                <div className="stat-label">Notifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="features" style={{ padding: '2rem 0' }}>
          <div className="features-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {/* Recent Projects */}
              <div className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Projects</h3>
                  <button
                    onClick={() => navigate('/projects')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                  >
                    View all
                  </button>
                </div>
                <div>
                  {recentProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>No projects yet</p>
                      <button
                        onClick={() => navigate('/projects')}
                        className="btn btn-primary"
                      >
                        Create your first project
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {recentProjects.map(project => (
                        <div
                          key={project.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => navigate(`/projects/${project.id}`)}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <div>
                            <h4 style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{project.name}</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>{project.description}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {project.members?.length || 0} members • {project.tasks?.length || 0} tasks
                            </p>
                          </div>
                          <span style={{ color: 'var(--muted)' }}>→</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Notifications</h3>
                  <button
                    onClick={() => navigate('/projects')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                  >
                    View all
                  </button>
                </div>
                <div>
                  {unreadNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                      <p style={{ color: 'var(--muted)' }}>No new notifications</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {unreadNotifications.slice(0, 5).map(notification => (
                        <div key={notification.id} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: '#eff6ff',
                          borderRadius: '0.5rem',
                          border: '1px solid #dbeafe'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--brand)',
                            borderRadius: '50%',
                            marginTop: '0.5rem',
                            flexShrink: 0
                          }}></div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{notification.text}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {new Date(notification.ts).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="features" style={{ padding: '2rem 0', backgroundColor: 'var(--bg)' }}>
          <div className="features-container">
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>Quick Actions</h2>
            <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <button
                onClick={() => navigate('/projects')}
                className="feature-card"
                style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <span style={{ fontSize: '2rem' }}>➕</span>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Create Project</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Start a new project</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="feature-card"
                style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <span style={{ fontSize: '2rem' }}>📋</span>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>View Projects</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Manage your projects</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="feature-card"
                style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <span style={{ fontSize: '2rem' }}>👤</span>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Profile</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Manage your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
