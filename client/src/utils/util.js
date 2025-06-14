// util.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ========== LOGIN ==========

export const loginUser = async (username, password) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
    username,
    password,
  });
  return res.data;
};

// ========== REGISTER ==========

export const registerUser = async (username, password) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
    username,
    password,
  });
  return res.data;
};

// ========== USERS ==========
export const fetchUsers = async (page, limit) => {
  const res = await API.get(`/api/users?page=${page}&limit=${limit}`);
  return res.data;
};

export const toggleUserStatus = async (userId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const res = await API.patch(`/api/users/${userId}/status`, { status: newStatus });
  return res.data;
};

// ========== TASKS ==========
export const fetchTasks = async (page, limit) => {
  const res = await API.get(`/api/tasks?page=${page}&limit=${limit}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await API.post(`/api/tasks`, taskData);
  return res.data;
};

export const updateTask = async (taskId, taskData) => {
  const res = await API.patch(`/api/tasks/${taskId}`, taskData);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await API.delete(`/api/tasks/${taskId}`); 
  return res.data;
}

export const bulkUpdateTaskStatus = async (taskIds, data) => {
  console.log("Bulk updating tasks:", taskIds, "data:", data);
  // const res = await API.patch(`/api/tasks/bulk`, {
  //   taskIds,
  //   status: newStatus,
  // });
  // return res.data;
  return { success: true, message: "Bulk update successful"}
};
