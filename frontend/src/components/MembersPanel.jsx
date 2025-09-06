import React, { useState } from 'react';

const MembersPanel = ({ isOpen, onClose, project, onAddMember, onRemoveMember, currentUser }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    setAdding(true);
    try {
      await onAddMember(newMemberEmail.trim());
      setNewMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (email) => {
    if (window.confirm(`Are you sure you want to remove ${email} from this project?`)) {
      try {
        await onRemoveMember(email);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Project Members</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Add new member */}
        <form onSubmit={handleAddMember} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member email"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={adding || !newMemberEmail.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
        
        {/* Members list */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Current Members:</h4>
          {project?.members?.map((member, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{member}</span>
                {member === project.ownerEmail && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Owner
                  </span>
                )}
              </div>
              {member !== project.ownerEmail && currentUser?.email === project.ownerEmail && (
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersPanel;
