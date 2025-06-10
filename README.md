# MERN Task Manager

A full-stack Task Manager web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It features role-based authentication (Admin, Regular User), a fully functional Admin Panel for managing users and tasks, and a responsive User Panel for daily task management.

---

## 📚 Summary

This project allows users to register, log in, and manage personal tasks. Admins have access to an Admin Panel to manage users (activate/deactivate), assign tasks, and monitor progress. Tasks can be created, marked as complete, or deleted. JWT-based authentication is used to protect routes.

---

## ⚙️ Tech Stack

- **Frontend**: React.js (with Redux Toolkit), Material UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (cloud)
- **Authentication**: JWT (with token versioning for logout-all feature)
- **Storage**: LocalStorage for token and user info
- **Styling**: Plain CSS and Material UI
- **State Management**: Redux

---

## 🚀 Features

- 🔐 Secure login/signup with JWT authentication
- 🧑‍💼 Admin panel:
  - View all users
  - Toggle user status (active/inactive)
  - Assign tasks to regular users
  - Logout all devices on status change
- 👤 Regular user panel:
  - View tasks (Pending / Completed / Deleted)
  - Add/edit/delete/complete tasks
  - Sort by due date or priority
- 🌙 Light/Dark mode toggle
- 📱 Fully responsive UI
- 📦 Structured folder organization (MVC for backend, modular for frontend)

----

BASE_URL= https://task-manager-m8tf.onrender.com (backend)

----
BASE_URL= https://resilient-sable-b912ac.netlify.app (client)

## 📡 API Endpoints

### 🔑 Auth

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login user and get token |
| POST   | `/api/auth/logout`   | Logout current session |
| POST   | `/api/auth/logout-all` | Logout from all devices |

---

### 👤 Users (Admin Only)

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/api/users`                  | Get list of all users      |
| PATCH  | `/api/users/:id/status`       | Toggle user status         |

---

### ✅ Tasks

| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | `/api/tasks`                  | Get all tasks of logged-in user |
| POST   | `/api/tasks`                  | Create new task             |
| PATCH  | `/api/tasks/:taskId`              | Update task                 |
| DELETE | `/api/tasks/:taskId`              | Delete task                 |
| PATCH | `/api/tasks/bulk`              | Bulk update task                 |

---

## 🧪 Sample API Request (Frontend Utils)

```js
// Login
export const loginUser = async (username, password) => {
  const res = await axios.post(`${API}/api/auth/login`, { username, password });
  return res.data;
};

// Toggle user status
export const toggleUserStatus = async (userId, status, token) => {
  await axios.patch(`${API}/api/users/${userId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
