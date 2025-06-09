import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import {
  fetchUsers,
  toggleUserStatus,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../../../src/utils/util';
import Loader from '../common/Loader';

const PAGE_SIZE = 5;

const AdminDashboard = () => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state) => state.user);
  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearchInput, setUserSearchInput] = useState("");
  const [filterText, setFilterText] = useState("");

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

  //EDIT TASKS
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loadingIds, setLoadingIds] = useState(new Set());

  //Bulk Task State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    title: "",
    description: "",
    completed: false,
    dueDate: "",
    assignedTo: "",
  });
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleOpenEdit = (task) => {
    setEditTask(task);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditTask(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    setLoadingIds((prev) => new Set(prev).add(editTask._id));
    try {
      await updateTask(editTask._id, editTask);
      alert("Task updated");
      loadTasks(tasksPage);
      handleCloseEdit();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(editTask._id);
        return newSet;
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure to delete this task?")) return;
    setLoadingIds((prev) => new Set(prev).add(taskId));
    try {
      await deleteTask(taskId);
      alert("Task deleted");
      loadTasks(tasksPage);
      setSelectedTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const [loader, setLoader] = useState(true);
  const [loadingButton, setLoadingButton] = useState(null);
  const [loadUserList, setLoadUserList] = useState(null);
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
      setUsersTotalPages(data.total ? Math.ceil(data.total / PAGE_SIZE) : 1);
      if (data.page) {
        setUsersPage(data.page);
      } else {
        setUsersPage(page);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  //Load Tasks
  const loadTasks = async (page = 1) => {
    try {
      setLoader(true);
      const data = await fetchTasks(page, PAGE_SIZE);
      setTasks(data.tasks);
      setTasksTotalPages(Math.ceil(data.total / PAGE_SIZE));
      setTasksPage(page);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoader(false);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const msg = "" ;
    try {
      const res = await toggleUserStatus(userId, currentStatus);
      loadUsers(usersPage);
    } catch (err) {
      console.error("Failed to update user status:", err);
      alert(`${data.message}`)
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
    const allSelected = tasks.every((task) => selectedTaskIds.has(task._id));
    const newSet = new Set(selectedTaskIds);
    if (allSelected) {
      // Unselect all on page
      tasks.forEach((task) => newSet.delete(task._id));
    } else {
      // Select all on page
      tasks.forEach((task) => newSet.add(task._id));
    }
    setSelectedTaskIds(newSet);
  };

  // Bulk update status
 const handleBulkUpdate = async () => {
   setBulkLoading(true);

   const getCleanUpdateData = (rawData) => {
     const cleaned = {};
     for (const key in rawData) {
       const value = rawData[key];
       if (
         (typeof value === "string" && value.trim() !== "") ||
         typeof value === "boolean" ||
         (typeof value === "object" && value !== null)
       ) {
         cleaned[key] = value;
       }
     }
     return cleaned;
   };

   try {
     const cleanedData = getCleanUpdateData(bulkUpdateData);

     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/bulk`, {
       method: "PATCH",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${localStorage.getItem("token")}`,
       },
       body: JSON.stringify({
         taskIds: Array.from(selectedTaskIds),
         updateData: cleanedData,
       }),
     });

     if (!response.ok) {
       alert("Bulk update failed");
       return;
     }

     await loadTasks(tasksPage);
     alert("Bulk update successful");
     setSelectedTaskIds(new Set());
     setBulkModalOpen(false);
   } catch (err) {
     console.error("Bulk update failed", err);
   } finally {
     setBulkLoading(false);
   }
 };


  const getUsernameById = (id) => {
    const user = users.find((u) => u._id === id);
    return user ? user.username?.toUpperCase() : "Unknown";
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

const filteredUsers = users.filter((user) => {
  const trimmed = filterText.trim().toLowerCase();

  if (trimmed.startsWith("{role=")) {
    const roleValue = trimmed.split("=")[1]?.replace("}", "").trim();
    return user.role.toLowerCase() === roleValue;
  }

  if (trimmed.startsWith("{username=")) {
    const usernameValue = trimmed.split("=")[1]?.replace("}", "").trim();
    return user.username.toLowerCase().includes(usernameValue);
  }

  return true;
});

  useEffect(() => {
    loadUsers(usersPage);
    loadTasks(tasksPage);
  }, []);

  
  if (loader) return <Loader />;

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      Admin Dashboard
      {/* Users Section */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#3f51b5",
          display: "inline-block",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        Users (Page {usersPage} of {usersTotalPages})
      </Typography>
      {/* //Users Filter */}
      <TextField
        size="small"
        variant="outlined"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter by {role=user} or {username=rohit}"
        sx={{
          minWidth: "300px",
          maxWidth: "770px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#ccc",
            },
            "&:hover fieldset": {
              borderColor: "#5c6bc0",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3f51b5",
            },
            fontSize: "0.9rem",
            color: "#333",
            paddingLeft: 1,
          },
          "& input::placeholder": {
            color: "#999",
            fontStyle: "italic",
            fontSize: "0.85rem",
          },
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "30px",
        }}
      >
        {/* Users Table */}
        <Box sx={{ flex: 2, minWidth: "300px" }}>
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "#3f51b5" }}>
                    Username
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#3f51b5" }}>
                    Role
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#3f51b5",
                      textAlign: "center",
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell sx={{ fontStyle: "italic", color: "#555" }}>
                      {user.username?.toUpperCase()}
                    </TableCell>
                    <TableCell sx={{ fontStyle: "italic", color: "#555" }}>
                      {user.role}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color={user.status === "active" ? "success" : "error"}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.7rem",
                          borderRadius: "16px",
                          minWidth: "auto",
                          fontWeight: "bold",
                          letterSpacing: 0.5,
                        }}
                        onClick={() =>
                          handleToggleUserStatus(user._id, user.status)
                        }
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#c5cae9",
                  color: "#1a237e",
                  "&:hover": { backgroundColor: "#9fa8da" },
                  textTransform: "none",
                }}
                disabled={usersPage <= 1 || loadUserList === "prev"}
                onClick={() => {
                  setLoadUserList("prev");
                  loadUsers(usersPage - 1).finally(() => setLoadUserList(null));
                }}
              >
                {loadUserList === "prev" ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                  </span>
                ) : (
                  "← Previous"
                )}
              </Button>

              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#c5cae9",
                  color: "#1a237e",
                  "&:hover": { backgroundColor: "#9fa8da" },
                  textTransform: "none",
                }}
                disabled={
                  usersPage >= usersTotalPages || loadUserList === "next"
                }
                onClick={() => {
                  setLoadUserList("next");
                  loadUsers(usersPage + 1).finally(() => setLoadUserList(null));
                }}
              >
                {loadUserList === "next" ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                  </span>
                ) : (
                  "Next →"
                )}
              </Button>
            </Stack>
          </Box>
        </Box>
        {/* Create Task Form */}
        <div
          style={{
            flex: 1,
            padding: "16px",
            width: "100%",
            maxWidth: "350px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create Task
          </Typography>

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newTask.title}
            onChange={handleTaskInputChange}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              fontSize: "0.95rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleTaskInputChange}
            style={{
              width: "95%",
              padding: "10px",
              marginBottom: "12px",
              fontSize: "0.95rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "vertical",
              minHeight: "100px",
            }}
          />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleTaskInputChange}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.95rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />

            {users.some((u) => u.role === "user") && (
              <select
                name="assignedTo"
                value={newTask.assignedTo}
                onChange={handleTaskInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
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

          <Button
            variant="contained"
            size="small"
            onClick={handleCreateTask}
            fullWidth
            sx={{
              backgroundColor: "#5c6bc0",
              mt: 2,
              "&:hover": {
                backgroundColor: "#3f51b5",
              },
            }}
          >
            Create Task
          </Button>
        </div>
      </div>
      <Divider sx={{ my: 4 }} />
      {/* Tasks Section */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#3f51b5",
          display: "inline-block",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        Tasks (Page {tasksPage} of {tasksTotalPages})
      </Typography>
      <Typography variant="body1">
        Selected Tasks: {selectedTaskIds.size}
      </Typography>
      {/* // Task Table Functionality */}
      <Box display="flex" flexWrap="wrap" gap="6px" alignItems="center" mb={2}>
        <Tooltip
          title={
            selectedTaskIds.size === 0
              ? "Select tasks to enable"
              : "Bulk update selected tasks"
          }
        >
          <span>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBulkModalOpen(true)}
              disabled={selectedTaskIds.size === 0}
              sx={{ width: "fit-content" }}
            >
              Bulk Update
            </Button>
          </span>
        </Tooltip>
        <TextField
          label="Filter by User"
          variant="outlined"
          size="small"
          value={assignedToFilter}
          onChange={(e) => setAssignedToFilter(e.target.value)}
          // sx={{ minWidth: 200 }}
        />

        <TextField
          label="Due Date"
          type="date"
          variant="outlined"
          size="small"
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 130 }}
        />

        <TextField
          label="Status"
          select
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </TextField>
      </Box>
      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            value={editTask?.title || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={editTask?.description || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            label="Due Date"
            name="dueDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editTask?.dueDate ? editTask.dueDate.split("T")[0] : ""}
            onChange={handleEditInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editTask?.completed || false}
                onChange={(e) =>
                  setEditTask((prev) => ({
                    ...prev,
                    completed: e.target.checked,
                  }))
                }
              />
            }
            label="Completed"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button
            onClick={handleUpdateTask}
            disabled={loadingIds.has(editTask?._id)}
          >
            {loadingIds.has(editTask?._id) ? (
              <CircularProgress size={20} />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
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
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTasks.map((task) => {
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const now = new Date();
              const isOverdue = dueDate && dueDate < now;
              const isDueSoon =
                dueDate &&
                dueDate.getTime() - now.getTime() <= 2 * 24 * 60 * 60 * 1000;

              return (
                <TableRow
                  key={task._id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f9f9f9" },
                    transition: "background 0.3s ease",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTaskIds.has(task._id)}
                      onChange={() => toggleTaskSelection(task._id)}
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 500, color: "#333" }}>
                    {task.title}
                  </TableCell>

                  <TableCell sx={{ fontStyle: "italic", color: "#666" }}>
                    {task.description}
                  </TableCell>

                  <TableCell>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        backgroundColor: task.completed ? "#e8f5e9" : "#ffebee",
                        color: task.completed ? "#388e3c" : "#c62828",
                      }}
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </TableCell>

                  <TableCell sx={{ fontStyle: "italic", color: "#555" }}>
                    {getUsernameById(task.assignedTo)}
                  </TableCell>

                  <TableCell>
                    {dueDate ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#5c6bc0",
                          fontWeight: 500,
                        }}
                        title={
                          isOverdue
                            ? "Overdue"
                            : isDueSoon
                            ? "Due Soon"
                            : "On Track"
                        }
                      >
                        <i
                          className={`fas ${
                            isOverdue
                              ? "fa-exclamation-circle"
                              : isDueSoon
                              ? "fa-clock"
                              : "fa-check-circle"
                          }`}
                        ></i>
                        {dueDate.toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ color: "#999" }}>N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleOpenEdit(task)}
                        disabled={loadingIds.has(task._id)}
                        title="Edit Task"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#1976d2",
                          fontSize: "1rem",
                        }}
                      >
                        {loadingIds.has(task._id) ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-edit"></i>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        disabled={loadingIds.has(task._id)}
                        title="Delete Task"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#d32f2f",
                          fontSize: "1rem",
                        }}
                      >
                        {loadingIds.has(task._id) ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash-alt"></i>
                        )}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          disabled={tasksPage <= 1 || loadingButton === "prev"}
          onClick={() => {
            setLoadingButton("prev");
            loadTasks(tasksPage - 1).finally(() => setLoadingButton(null));
          }}
        >
          {loadingButton === "prev" ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </span>
          ) : (
            "Previous"
          )}
        </Button>

        <Button
          disabled={tasksPage >= tasksTotalPages || loadingButton === "next"}
          onClick={() => {
            setLoadingButton("next");
            loadTasks(tasksPage + 1).finally(() => setLoadingButton(null));
          }}
        >
          {loadingButton === "next" ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </span>
          ) : (
            "Next"
          )}
        </Button>
      </Stack>
      {bulkModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Bulk Update Tasks</h3>

            <input
              placeholder="Title"
              style={{ width: "100%", marginBottom: "10px" }}
              value={bulkUpdateData.title}
              onChange={(e) =>
                setBulkUpdateData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />

            <textarea
              placeholder="Description"
              style={{ width: "100%", marginBottom: "10px" }}
              rows={3}
              value={bulkUpdateData.description}
              onChange={(e) =>
                setBulkUpdateData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={bulkUpdateData.completed}
                  onChange={(e) =>
                    setBulkUpdateData((prev) => ({
                      ...prev,
                      completed: e.target.checked,
                    }))
                  }
                />
              }
              label="Completed"
            />

            <input
              type="date"
              style={{ width: "100%", marginBottom: "10px" }}
              value={bulkUpdateData.dueDate}
              onChange={(e) =>
                setBulkUpdateData((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
            />

            {/* Conditionally show assignedTo if admin */}
            {user?.role === "admin" && (
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Assign To:
                </label>
                <select
                  value={bulkUpdateData.assignedTo || ""}
                  onChange={(e) =>
                    setBulkUpdateData((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setBulkModalOpen(false)}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </button>
              <button onClick={handleBulkUpdate}>
                {bulkLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
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
