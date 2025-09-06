import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject } from '../lib/api';
import { getAuth } from 'firebase/auth';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [success, setSuccess] = useState('');

  // Get ID token from Firebase Auth or localStorage
  const getIdToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      } else {
        // Fallback to localStorage
        return localStorage.getItem('idToken');
      }
    } catch (error) {
      console.error('Error getting ID token:', error);
      return localStorage.getItem('idToken');
    }
  };

  // Load projects on component mount
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const idToken = await getIdToken();
      
      // If no token, redirect to login
      if (!idToken) {
        window.location = '/login';
        return;
      }

      const data = await fetchProjects(idToken);
      setProjects(data || []);
      
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Handle project creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const idToken = await getIdToken();
      
      if (!idToken) {
        window.location = '/login';
        return;
      }

      const newProject = await createProject({ name: projectName.trim() }, idToken);
      
      // Add to local list and clear form
      setProjects(prev => [...prev, newProject]);
      setProjectName('');
      setSuccess('Project created successfully!');
      
      // Navigate to project detail
      setTimeout(() => {
        navigate(`/projects/${newProject.id}`);
      }, 1000);
      
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // Retry loading projects
  const handleRetry = () => {
    loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Projects</h1>

      {/* Success message */}
      {success && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
          {!loading && (
            <button 
              onClick={handleRetry}
              style={{ 
                marginLeft: '10px', 
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Create project form */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '4px',
        marginBottom: '30px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>Create New Project</h3>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            style={{ 
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating}
            style={{ 
              padding: '8px 16px',
              backgroundColor: creating ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {/* Projects list */}
      <div>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>Your Projects</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div>⏳ Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            No projects yet. Create your first project above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{ 
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#495057' }}>{project.name}</h4>
                    <small style={{ color: '#6c757d' }}>
                      ID: {project.id} | Owner: {project.owner}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;