import React, { useState, useEffect } from 'react';
import api from '../lib/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching projects...');
      
      const response = await api.get('/projects');
      console.log('Projects response:', response.data);
      
      // Handle different response structures defensively
      let projectsData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (Array.isArray(response.data.projects)) {
          projectsData = response.data.projects;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        }
      }
      
      setProjects(projectsData);
      console.log('Set projects state:', projectsData);
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to load projects';
      setError(errorMessage);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    setCreating(true);
    setError('');

    try {
      console.log('Creating project:', formData);
      
      const response = await api.post('/projects', {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      console.log('Project created successfully:', response.data);
      
      // Reset form
      setFormData({ name: '', description: '' });
      
      // Refresh projects list
      await fetchProjects();
      
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create project';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      {/* Global Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Project Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description (optional)"
            />
          </div>
          
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : !Array.isArray(projects) || projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {!Array.isArray(projects) 
                ? 'Error loading projects data' 
                : 'No projects found. Create your first project above!'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => {
              // Defensive rendering in case project data is malformed
              if (!project || typeof project !== 'object') {
                return (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <p className="text-red-600">Invalid project data</p>
                  </div>
                );
              }
              
              return (
                <div key={project._id || project.id || index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold">
                    {project.name || 'Unnamed Project'}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 mt-2">{project.description}</p>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    Created: {project.createdAt 
                      ? new Date(project.createdAt).toLocaleDateString() 
                      : 'Unknown'
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;