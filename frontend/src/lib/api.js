import axios from 'axios';

// === Projects ===
export const fetchProjects = async (idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.get('/api/projects', { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProject = async (payload, idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.post('/api/projects', payload, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProjectDetail = async (projectId, idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.get(`/api/projects/${projectId}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// === Members ===
export const addMember = async (projectId, email, idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.post(
      `/api/projects/${projectId}/members`,
      { email },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeMember = async (projectId, email, idToken) => {
  try {
    const headers = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.delete(
      `/api/projects/${projectId}/members/${encodeURIComponent(email)}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// === Tasks ===
export const fetchTasks = async (projectId, idToken) => {
  try {
    const headers = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.get(`/api/projects/${projectId}/tasks`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTask = async (projectId, payload, idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.post(`/api/projects/${projectId}/tasks`, payload, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// === Comments ===
export const fetchComments = async (projectId, taskId, idToken) => {
  try {
    const headers = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.get(`/api/projects/${projectId}/tasks/${taskId}/comments`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addComment = async (projectId, taskId, text, idToken, replyTo = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.post(
      `/api/projects/${projectId}/tasks/${taskId}/comments`,
      { text, replyTo },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// === Notifications ===
export const fetchNotifications = async (idToken) => {
  try {
    const headers = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.get('/api/notifications', { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationsRead = async (ids, idToken) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await axios.post('/api/notifications/mark-read', { ids }, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

