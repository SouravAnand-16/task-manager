import React, { useEffect, useState } from 'react';
import {
  fetchUsers,
  toggleUserStatus,
  fetchTasks,
  bulkUpdateTaskStatus,
} from '../../../src/utils/util';

const PAGE_SIZE = 5;

const AdminDashboard = () => {
  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);

  // Selected tasks IDs (across pages)
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Load Users
   const loadUsers = async (page = 1) => {
    try {
      const data = await fetchUsers(page, PAGE_SIZE);
      setUsers(data.users);
      setUsersTotalPages(data.totalPages);
      setUsersPage(page);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  //Load Tasks
  const loadTasks = async (page = 1) => {
    try {
      const data = await fetchTasks(page, PAGE_SIZE);
      setTasks(data.tasks);
      setTasksTotalPages(data.totalPages);
      setTasksPage(page);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, currentStatus);
      loadUsers(usersPage);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTaskIds(newSet);
  };

  // Toggle select all tasks on current page
  const toggleSelectAll = () => {
    const allSelected = tasks.every(task => selectedTaskIds.has(task._id));
    const newSet = new Set(selectedTaskIds);
    if (allSelected) {
      // Unselect all on page
      tasks.forEach(task => newSet.delete(task._id));
    } else {
      // Select all on page
      tasks.forEach(task => newSet.add(task._id));
    }
    setSelectedTaskIds(newSet);
  };

  // Bulk update status
   const handleBulkTaskStatus = async (newStatus) => {
    if (selectedTaskIds.size === 0) return alert('Select tasks to update');
    try {
      await bulkUpdateTaskStatus(Array.from(selectedTaskIds), newStatus);
      alert('Tasks updated');
      loadTasks(tasksPage);
      setSelectedTaskIds(new Set());
    } catch (err) {
      console.error('Error updating tasks:', err);
    }
  };

  const getUsernameById = (id) => {
    const user = users.find(u => u._id === id);
    return user ? user.username : 'Unknown';
  };

  useEffect(() => {
    loadUsers(usersPage);
    loadTasks(tasksPage);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Users (Page {usersPage} of {usersTotalPages})</h2>
        <table border="1" cellPadding="5" style={{ width: '100%', marginBottom: '1rem' }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              {/* Add UI for changing user status here if needed */}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                 <td>
                  <button onClick={() => handleToggleUserStatus(user._id, user.status)}>
                    {user.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button disabled={usersPage <= 1} onClick={() => loadUsers(usersPage - 1)}>Previous</button>
        <button disabled={usersPage >= usersTotalPages} onClick={() => loadUsers(usersPage + 1)}>Next</button>
      </section>

      <section>
        <h2>Tasks (Page {tasksPage} of {tasksTotalPages})</h2>
        <p>Selected Tasks: {selectedTaskIds.size}</p>
        <button onClick={() => handleBulkTaskStatus('completed')}>Mark Completed</button>
        <button onClick={() => handleBulkTaskStatus('pending')}>Mark Pending</button>
        <table border="1" cellPadding="5" style={{ width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && tasks.every(task => selectedTaskIds.has(task._id))}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Title</th>
              <th>Description</th>
              <th>Asigned to</th>
              <th>Completed</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task._id)}
                    onChange={() => toggleTaskSelection(task._id)}
                  />
                </td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                 <td>{getUsernameById(task.assignedTo)}</td>
                <td>{task.completed ? 'Yes' : 'No'}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                 <td>
                  <button title="Edit Task">✏️</button>
                  <button title="Delete Task">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button disabled={tasksPage <= 1} onClick={() => loadTasks(tasksPage - 1)}>Previous</button>
        <button disabled={tasksPage >= tasksTotalPages} onClick={() => loadTasks(tasksPage + 1)}>Next</button>
      </section>
    </div>
  );
};

export default AdminDashboard;
