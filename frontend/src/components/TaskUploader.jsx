import React, { useState } from 'react';
import api from '../lib/api';
import { auth } from '../lib/firebase';

const TaskUploader = ({ projectId, taskId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`;

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorData}`);
    }

    return await response.json();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress for upload to Cloudinary
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      console.log('Uploading file to Cloudinary:', file.name);
      
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file);
      
      clearInterval(progressInterval);
      setProgress(90);
      
      console.log('Cloudinary upload result:', cloudinaryResult);

      // Get current user info
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Extract metadata for backend
      const attachmentMetadata = {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        name: cloudinaryResult.original_filename || file.name,
        size: cloudinaryResult.bytes || file.size,
        mime: cloudinaryResult.format ? `image/${cloudinaryResult.format}` : file.type,
        uploaderId: user.uid, // This will be resolved to mongoose ObjectId in backend
        uploaderName: user.displayName || user.email || 'Unknown User'
      };

      console.log('Sending attachment metadata to backend:', attachmentMetadata);

      // Send metadata to backend
      const backendResponse = await api.patch(`/projects/${projectId}/tasks/${taskId}/attachments`, {
        attachment: attachmentMetadata
      });

      console.log('Backend response:', backendResponse.data);
      
      setProgress(100);
      
      // Reset state
      setFile(null);
      setProgress(0);
      
      // Call success callback
      if (onUploaded) {
        onUploaded();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {file && (
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-700">
            <div><strong>File:</strong> {file.name}</div>
            <div><strong>Size:</strong> {formatFileSize(file.size)}</div>
            <div><strong>Type:</strong> {file.type || 'Unknown'}</div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setFile(null);
            setError('');
            setProgress(0);
          }}
          disabled={uploading}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default TaskUploader;
