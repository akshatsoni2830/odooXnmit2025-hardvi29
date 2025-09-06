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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">SynergySphere</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsBell idToken={idToken} />
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Welcome, {user?.displayName || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'User'}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + (project.tasks?.filter(t => t.status === 'Done').length || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + (project.tasks?.filter(t => t.status === 'In Progress').length || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{unreadNotifications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📁</span>
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <button
                    onClick={() => navigate('/projects')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create your first project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.description}</p>
                        <p className="text-xs text-gray-500">
                          {project.members?.length || 0} members • {project.tasks?.length || 0} tasks
                        </p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🔔</span>
                  <p className="text-gray-500">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreadNotifications.slice(0, 5).map(notification => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
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

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">➕</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Project</p>
                <p className="text-sm text-gray-600">Start a new project</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">📋</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Projects</p>
                <p className="text-sm text-gray-600">Manage your projects</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">👤</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">Profile</p>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
