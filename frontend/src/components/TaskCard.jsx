import React, { useState } from 'react';

const TaskCard = ({ task, onUpdate, onDelete, projectMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    assignee: task.assignee || '',
    dueDate: task.dueDate || '',
    status: task.status,
    priority: task.priority
  });

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      assignee: task.assignee || '',
      dueDate: task.dueDate || '',
      status: task.status,
      priority: task.priority
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            rows="2"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editData.assignee}
              onChange={(e) => setEditData(prev => ({ ...prev, assignee: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="">Unassigned</option>
              {projectMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex justify-between">
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <select
              value={editData.status}
              onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-xs mb-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            {task.assignee && (
              <div>👤 {task.assignee}</div>
            )}
            {task.dueDate && (
              <div>📅 {new Date(task.dueDate).toLocaleDateString()}</div>
            )}
            <div>🕒 {new Date(task.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
