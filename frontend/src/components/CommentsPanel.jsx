import React, { useState } from 'react';

const CommentsPanel = ({ taskId, comments = [], onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(taskId, {
      text: newComment.trim(),
      replyTo: replyingTo
    });
    
    setNewComment('');
    setReplyingTo(null);
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  const renderComment = (comment, level = 0) => {
    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm">
              <span className="font-medium text-gray-900">{comment.authorEmail}</span>
              <span className="text-gray-500 ml-2">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            {level === 0 && (
              <button
                onClick={() => handleReply(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reply
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm">{comment.text}</p>
        </div>
        
        {/* Render replies */}
        {comments
          .filter(reply => reply.replyTo === comment.id)
          .map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  const topLevelComments = comments.filter(comment => !comment.replyTo);

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Comments ({comments.length})</h4>
      
      {/* Add new comment */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex justify-between items-center">
          {replyingTo && (
            <span className="text-xs text-gray-500">
              Replying to comment
            </span>
          )}
          <div className="flex space-x-2">
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {replyingTo ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-2">
        {topLevelComments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;
