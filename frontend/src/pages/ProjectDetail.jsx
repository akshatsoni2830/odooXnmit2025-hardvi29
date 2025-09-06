import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, fetchTasks, createTask, addMember, fetchNotifications } from '../lib/api';
import { getAuth } from 'firebase/auth';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [idToken, setIdToken] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) {
        navigate('/login');
        return;
      }
      setIdToken(token);

      const [projectData, notificationsData] = await Promise.all([
        getProjectDetail(id, token),
        fetchNotifications(token)
      ]);

      setProject(projectData);
      setTasks(projectData.tasks || []);
      setNotifications(notificationsData.filter(n => !n.read));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      return user ? await user.getIdToken() : localStorage.getItem('idToken');
    } catch (error) {
      return localStorage.getItem('idToken');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(id, taskData, idToken);
      setTasks(prev => [...prev, newTask]);
      setShowCreateTask(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleAddMember = async (email) => {
    try {
      await addMember(id, email, idToken);
      loadData(); // Reload project data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  if (!project) return <div style={{ padding: '20px' }}>Project not found</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>{project.name}</h1>
          <p style={{ color: '#666' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowMembers(!showMembers)}>
            Members ({project.members?.length || 0})
          </button>
          <button onClick={() => setShowCreateTask(true)}>
            New Task
          </button>
          <button style={{ position: 'relative' }}>
            🔔 {notifications.length > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-5px', 
                right: '-5px', 
                background: 'red', 
                color: 'white', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Members Panel */}
      {showMembers && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '5px' 
        }}>
          <h3>Members</h3>
          <div style={{ marginBottom: '10px' }}>
            {project.members?.map(member => (
              <div key={member.uid} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '5px 0',
                borderBottom: '1px solid #ddd'
              }}>
                <span>{member.email} ({member.role})</span>
                {member.role === 'owner' && <span style={{ color: '#666' }}>Owner</span>}
              </div>
            ))}
          </div>
          <AddMemberForm onAdd={handleAddMember} />
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal 
          project={project}
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {/* Tasks List */}
      <div>
        <h3>Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p style={{ color: '#666' }}>No tasks yet. Create your first task!</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} projectId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple components
const AddMemberForm = ({ onAdd }) => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onAdd(email.trim());
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        style={{ flex: 1, padding: '8px' }}
      />
      <button type="submit">Add Member</button>
    </form>
  );
};

const CreateTaskModal = ({ project, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '5px', 
        width: '500px' 
      }}>
        <h3>Create New Task</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '8px', height: '80px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <select
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select assignee</option>
              {project.members?.map(member => (
                <option key={member.uid} value={member.uid}>
                  {member.email}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">Create Task</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, projectId }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do': return '#6c757d';
      case 'In Progress': return '#007bff';
      case 'Done': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      borderRadius: '5px',
      background: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 5px 0' }}>{task.title}</h4>
          {task.description && (
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>{task.description}</p>
          )}
          <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
            <span style={{ 
              background: getStatusColor(task.status), 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '3px' 
            }}>
              {task.status}
            </span>
            <span style={{ 
              background: getPriorityColor(task.priority), 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '3px' 
            }}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button style={{ padding: '5px 10px', fontSize: '12px' }}>Edit</button>
          <button style={{ padding: '5px 10px', fontSize: '12px' }}>Comment</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
