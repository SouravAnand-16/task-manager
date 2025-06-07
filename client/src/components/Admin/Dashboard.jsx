import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  // Load users page
  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users?page=${page}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.users);
      setUsersTotalPages(res.data.totalPages);
      setUsersPage(page);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  // Load tasks page
  const fetchTasks = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/tasks?page=${page}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks);
      setTasksTotalPages(res.data.totalPages);
      setTasksPage(page);
    } catch (error) {
      console.error('Error fetching tasks', error);
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
  const bulkUpdateStatus = async (newStatus) => {
    if (selectedTaskIds.size === 0) {
      alert('Select tasks to update');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/tasks/bulk-update-status`,
        { taskIds: Array.from(selectedTaskIds), status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Tasks updated');
      fetchTasks(tasksPage);
      setSelectedTaskIds(new Set());
    } catch (error) {
      console.error('Error updating tasks', error);
    }
  };

  useEffect(() => {
    fetchUsers(usersPage);
    fetchTasks(tasksPage);
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
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button disabled={usersPage <= 1} onClick={() => fetchUsers(usersPage - 1)}>Previous</button>
        <button disabled={usersPage >= usersTotalPages} onClick={() => fetchUsers(usersPage + 1)}>Next</button>
      </section>

      <section>
        <h2>Tasks (Page {tasksPage} of {tasksTotalPages})</h2>
        <p>Selected Tasks: {selectedTaskIds.size}</p>
        <button onClick={() => bulkUpdateStatus('completed')}>Mark Completed</button>
        <button onClick={() => bulkUpdateStatus('pending')}>Mark Pending</button>
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
                <td>{task.completed ? 'Yes' : 'No'}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button disabled={tasksPage <= 1} onClick={() => fetchTasks(tasksPage - 1)}>Previous</button>
        <button disabled={tasksPage >= tasksTotalPages} onClick={() => fetchTasks(tasksPage + 1)}>Next</button>
      </section>
    </div>
  );
};

export default AdminDashboard;
