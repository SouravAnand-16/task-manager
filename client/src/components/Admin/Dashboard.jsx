import { useEffect, useState } from 'react';
import {
Container,
Typography,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Paper,
Button,
Checkbox,
Stack,
Divider,
} from '@mui/material';
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

  // Filters
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


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

  const filteredTasks = tasks.filter((task) => {
    const matchAssigned = assignedToFilter
      ? getUsernameById(task.assignedTo)
          .toLowerCase()
          .includes(assignedToFilter.toLowerCase())
      : true;
    const matchStatus = statusFilter
      ? statusFilter === "completed"
        ? task.completed
        : !task.completed
      : true;
    const matchDueDate = dueDateFilter
      ? new Date(task.dueDate) <= new Date(dueDateFilter)
      : true;
    return matchAssigned && matchStatus && matchDueDate;
  });


  useEffect(() => {
    loadUsers(usersPage);
    loadTasks(tasksPage);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      Admin Dashboard
      {/* Users Section */}
      <Typography variant="h5" gutterBottom>
        Users (Page {usersPage} of {usersTotalPages})
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    color={user.status === "active" ? "success" : "error"}
                    sx={{ padding: '2px 6px', fontSize: '0.65rem',   minWidth: '60px',width: '60px', }}
                    onClick={() =>
                      handleToggleUserStatus(user._id, user.status)
                    }
                  >
                    {user.status === "active" ? "🟢" : "🔴"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          disabled={usersPage <= 1}
          onClick={() => loadUsers(usersPage - 1)}
        >
          Previous
        </Button>
        <Button
          disabled={usersPage >= usersTotalPages}
          onClick={() => loadUsers(usersPage + 1)}
        >
          Next
        </Button>
      </Stack>
      <Divider sx={{ my: 4 }} />
      {/* Tasks Section */}
      <Typography variant="h5" gutterBottom>
        Tasks (Page {tasksPage} of {tasksTotalPages})
      </Typography>
      <Typography variant="body1">
        Selected Tasks: {selectedTaskIds.size}
      </Typography>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <button
          style={{ padding: "4px 8px", fontSize: "0.8rem" }}
          onClick={() => handleBulkTaskStatus("completed")}
        >
          ✅ Completed
        </button>
        <button
          style={{ padding: "4px 8px", fontSize: "0.8rem" }}
          onClick={() => handleBulkTaskStatus("pending")}
        >
          🕓 Pending
        </button>
        <input
          type="text"
          placeholder="Filter by User"
          value={assignedToFilter}
          onChange={(e) => setAssignedToFilter(e.target.value)}
          style={{ padding: "4px", fontSize: "0.8rem", width: "130px" }}
        />
        <input
          type="date"
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          style={{ padding: "4px", fontSize: "0.8rem" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "4px", fontSize: "0.8rem", width: "130px" }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    tasks.length > 0 &&
                    tasks.every((task) => selectedTaskIds.has(task._id))
                  }
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTaskIds.has(task._id)}
                    onChange={() => toggleTaskSelection(task._id)}
                  />
                </TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{getUsernameById(task.assignedTo)}</TableCell>
                <TableCell>{task.completed ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          disabled={tasksPage <= 1}
          onClick={() => loadTasks(tasksPage - 1)}
        >
          Previous
        </Button>
        <Button
          disabled={tasksPage >= tasksTotalPages}
          onClick={() => loadTasks(tasksPage + 1)}
        >
          Next
        </Button>
      </Stack>
    </Container>
  );
}

export default AdminDashboard;
