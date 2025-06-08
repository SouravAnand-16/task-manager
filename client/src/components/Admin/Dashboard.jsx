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
Box
} from '@mui/material';
import {
  fetchUsers,
  toggleUserStatus,
  fetchTasks,
  bulkUpdateTaskStatus,
  createTask,
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

  // Create tasks state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  });

  const [loading, setLoading] = useState(false);
  // Filters
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  // Selected tasks IDs (across pages)
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async () => {
    if (
      !newTask.title ||
      !newTask.description ||
      !newTask.dueDate ||
      !newTask.assignedTo
    ) {
      return alert("All fields are required");
    }

    try {
      const data = await createTask(newTask);
      if (!data || !data._id) {
        throw new Error("Task creation failed");
      }
      alert("Task created!");
      setNewTask({ title: "", description: "", dueDate: "", assignedTo: "" });
      loadTasks(tasksPage);
    } catch (err) {
      console.error("Create task failed:", err);
    }
  };


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
    return user ? user.username?.toUpperCase() : 'Unknown';
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
    <Container maxWidth="lg" sx={{ mt: 4 , display: 'flex', flexDirection: 'column', gap: 1, flexWrap: 'wrap'}}>
      Admin Dashboard
      {/* Users Section */}
      <Typography variant="h5" gutterBottom>
        Users (Page {usersPage} of {usersTotalPages})
      </Typography>
      <Stack direction="row" spacing={4} sx={{ mb: 3 }} flexWrap="wrap">
        {/* Users Table */}
        <Box>
          <TableContainer component={Paper} sx={{ flex: 1 }}>
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                  <TableCell sx={{ width: "60px", fontWeight:"bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell sx={{fontStyle: "italic",color: "#888"}}>{user.username?.toUpperCase()}</TableCell>
                    <TableCell sx={{fontStyle: "italic",color: "#888"}}>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color={user.status === "active" ? "success" : "error"}
                        sx={{
                          padding: "2px 6px",
                          fontSize: "0.65rem",
                          minWidth: "60px",
                          width: "60px",
                        }}
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
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2}>
              <Button
                size="small"
                variant="outlined"
                disabled={usersPage <= 1}
                onClick={() => loadUsers(usersPage - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={usersPage >= usersTotalPages}
                onClick={() => loadUsers(usersPage + 1)}
              >
                Next
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Create Task Form */}
        <Paper elevation={3} sx={{ flex: 1, p: 2, minWidth: "300px" }}>
          <Typography variant="h6">Create Task</Typography>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newTask.title}
            onChange={handleTaskInputChange}
            style={{ width: "100%", padding: "4px", marginBottom: "8px" }}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleTaskInputChange}
            style={{ width: "100%", padding: "4px", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleTaskInputChange}
              style={{ width: "100%", padding: "4px", marginBottom: "8px" }}
            />
            {/* Only show assignedTo dropdown if admin */}
            {users.some((u) => u.role === "user") && (
              <select
                name="assignedTo"
                value={newTask.assignedTo}
                onChange={handleTaskInputChange}
                style={{ width: "100%", padding: "4px", marginBottom: "8px" }}
              >
                <option value="">Assign to User</option>
                {users
                  .filter((u) => u.role === "user")
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <Button variant="contained" size="small" onClick={handleCreateTask}>
            Create Task
          </Button>
        </Paper>
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
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <button
          style={{
            padding: "4px 8px",
            fontSize: "0.8rem",
            width: "130px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          onClick={() => handleBulkTaskStatus("active")}
        >
          ✅ Completed
        </button>
        <button
          style={{
            padding: "4px 8px",
            fontSize: "0.8rem",
            width: "130px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          onClick={() => handleBulkTaskStatus("pending")}
        >
          ❌ Pending
        </button>
        <input
          type="text"
          placeholder="Filter by User"
          value={assignedToFilter}
          onChange={(e) => setAssignedToFilter(e.target.value)}
          style={{ padding: "8px", fontSize: "0.8rem", width: "130px" }}
        />
        <input
          type="date"
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          style={{ padding: "8px", fontSize: "0.8rem", width: "130px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px", fontSize: "0.8rem", width: "130px" }}
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
        <TableCell padding="checkbox" sx={{ fontWeight: "bold" }}>
          <Checkbox
            checked={
              tasks.length > 0 &&
              tasks.every((task) => selectedTaskIds.has(task._id))
            }
            onChange={toggleSelectAll}
          />
        </TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Due Date</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredTasks.map((task) => (
        <TableRow key={task._id}>
          <TableCell padding="checkbox" sx={{ fontWeight: "bold" }}>
            <Checkbox
              checked={selectedTaskIds.has(task._id)}
              onChange={() => toggleTaskSelection(task._id)}
            />
          </TableCell>
          <TableCell
            sx={{
              fontWeight: 600,
              color: "#555", 
            }}
          >
            {task.title}
          </TableCell>
          <TableCell
            sx={{
              fontStyle: "italic",
              color: "#888", 
            }}
          >
            {task.description}
          </TableCell>
          <TableCell sx={{fontStyle: "italic",color: "#888"}}>{getUsernameById(task.assignedTo)}</TableCell>
          <TableCell>{task.completed ? "✅" : "❌"}</TableCell>
          <TableCell
            sx={{
              fontStyle: "italic",
              color: "#e69500", 
            }}
          >
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

const styles = {
  headerCell: {
    fontWeight: 'bold',
  },
  checkboxCell: {
    fontWeight: 'bold',
  },
  titleCell: {
    fontWeight: 600,
    color: '#555', 
  },
  descriptionCell: {
    fontStyle: 'italic',
    color: '#888', 
  },
  dueDateCell: {
    fontStyle: 'italic',
    color: '#e69500', 
  },
};


export default AdminDashboard;
