import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import TaskUploader from '../components/TaskUploader';

const Tasks = () => {
  const { pid: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUploader, setShowUploader] = useState(null); // taskId or null
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: ''
  });

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project details and tasks in parallel
      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);

      setProject(projectResponse.data.project || projectResponse.data);
      setTasks(tasksResponse.data.tasks || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load project data');
      setTasks([]);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setCreating(true);
    setError('');

    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee || null,
        dueDate: formData.dueDate || null
      });

      console.log('Task created:', response.data);
      
      // Reset form
      setFormData({ title: '', description: '', assignee: '', dueDate: '' });
      
      // Refresh tasks
      await fetchProjectAndTasks();
      
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err?.response?.data?.error || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      setError('');
      const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, {
        status: newStatus
      });

      // Update tasks state with new task data
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.data.task : task
        )
      );

    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadComplete = async () => {
    setShowUploader(null);
    await fetchProjectAndTasks(); // Refresh to show new attachment
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectAndTasks();
    }
  }, [projectId]);

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    inprogress: tasks.filter(task => task.status === 'inprogress'),
    done: tasks.filter(task => task.status === 'done')
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading project tasks...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-6">
        <div className="text-center py-8">
          <div className="text-red-600">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-2">{project.name} - Tasks</h1>
      <p className="text-gray-600 mb-8">{project.description}</p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>
          
          <div className="md:col-span-2">
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
              placeholder="Enter task description (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <select
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {project.members?.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Tasks Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'todo', title: 'To-Do', color: 'blue' },
          { key: 'inprogress', title: 'In Progress', color: 'yellow' },
          { key: 'done', title: 'Done', color: 'green' }
        ].map(column => (
          <div key={column.key} className="bg-white rounded-lg shadow-md">
            <div className={`px-4 py-3 bg-${column.color}-100 rounded-t-lg border-b`}>
              <h3 className="font-semibold text-gray-800">
                {column.title} ({tasksByStatus[column.key].length})
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {tasksByStatus[column.key].map(task => (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                  
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    {task.assignee && (
                      <div>Assigned to: {task.assignee.name}</div>
                    )}
                    {task.dueDate && (
                      <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                    )}
                    <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                  </div>

                  {/* Attachments */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Attachments:</div>
                      {task.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-xs block"
                        >
                          📎 {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="todo">To-Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    
                    <button
                      onClick={() => setShowUploader(task._id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      Add File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload File</h3>
              <button
                onClick={() => setShowUploader(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <TaskUploader
              projectId={projectId}
              taskId={showUploader}
              onUploaded={handleUploadComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
