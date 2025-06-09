import { useEffect, useState } from "react";
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
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

import {
  fetchTasks,
  bulkUpdateTaskStatus,
  createTask,
  updateTask,
  deleteTask,
} from "../../../src/utils/util";
import Loader from "../common/Loader";
import "../../styles/table.css"

const PAGE_SIZE = 5;

const UserDashboard = () => {
   const { user } = useSelector(state => state.user);
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);

  // Create tasks state
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  //Edit Task
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

  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  // Filters
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selected tasks IDs (across pages)
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [loader,setLoader] = useState(true);

  const closeModal = () => {
    setNewTask({ title: "", description: "", dueDate: "" });
    setOpenDialog(false);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async () => {
    setLoading(true);
    if (!newTask.title || !newTask.description || !newTask.dueDate) {
      return alert("All fields are required");
    }
    try {
      const data = await createTask(newTask);
      if (!data || !data._id) {
        throw new Error("Task creation failed");
      }
      alert("Task created!");
      setNewTask({ title: "", description: "", dueDate: "" });
      loadTasks(tasksPage);
    } catch (err) {
      console.error("Create task failed:", err);
    } finally {
      setLoading(false);
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

  const filteredTasks = tasks.filter((task) => {
    const matchStatus = statusFilter
      ? statusFilter === "completed"
        ? task.completed
        : !task.completed
      : true;
    const matchDueDate = dueDateFilter
      ? new Date(task.dueDate) <= new Date(dueDateFilter)
      : true;
    return matchStatus && matchDueDate;
  });

  useEffect(() => {
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
      <Typography variant="h5" fontWeight="bold" mb={1}>
        🧑‍💻 User Dashboard
      </Typography>

      {/* Selected Tasks Info */}
      <Typography variant="body1" color="text.secondary" fontSize="0.9rem">
        Selected Tasks: <strong>{selectedTaskIds.size}</strong>
      </Typography>

      {/* Filters & Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {/* Left-side Controls */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{ width: "fit-content" }}
            onClick={() => setBulkModalOpen(true)}
          >
            🔁 Bulk Update
          </Button>

          <TextField
            type="date"
            size="small"
            label="Filter by Due Date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="completed">✅ Completed</MenuItem>
              <MenuItem value="pending">🕒 Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 1,
          maxWidth: "fit-content",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: "#5c6bc0",
            "&:hover": {
              backgroundColor: "#3f51b5", 
            },
          }}
        >
          + Create Task
        </Button>
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
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ borderCollapse: "collapse", minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: "#f7f9fc" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    tasks.length > 0 &&
                    tasks.every((t) => selectedTaskIds.has(t._id))
                  }
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
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
                <TableRow key={task._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTaskIds.has(task._id)}
                      onChange={() => toggleTaskSelection(task._id)}
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 400, color: "#333" }}>
                    {task.title}
                  </TableCell>

                  <TableCell sx={{ fontStyle: "italic", color: "#777" }}>
                    {task.description}
                  </TableCell>

                  <TableCell>
                    <span
                      style={{
                        fontWeight: "400",
                        color: task.completed ? "green" : "red",
                      }}
                      title={
                        task.completed
                          ? "This task is completed."
                          : "Task is pending."
                      }
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </TableCell>

                  <TableCell>
                    {dueDate ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#5c6bc0",
                          fontWeight:500,
                          fontStyle: isOverdue ? "italic" : "normal",
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
                      "N/A"
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        disabled={loadingIds.has(task._id)}
                        title="Edit Task"
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
      <Dialog open={openDialog} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Title"
            name="title"
            value={newTask.title}
            onChange={handleTaskInputChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={newTask.description}
            onChange={handleTaskInputChange}
            fullWidth
          />
          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleTaskInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await handleCreateTask();
              setOpenDialog(false);
            }}
          >
            {loading ? (
              <span>
                <i className="fas fa-spinner fa-spin"></i> Creating Task...
              </span>
            ) : (
              "Create Task"
            )}
          </Button>
        </DialogActions>
      </Dialog>
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
              <input
                placeholder="Assigned To (User ID)"
                style={{ width: "100%", marginBottom: "10px" }}
                value={bulkUpdateData.assignedTo}
                onChange={(e) =>
                  setBulkUpdateData((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }))
                }
              />
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
};

const styles = {
  headerCell: {
    fontWeight: "bold",
  },
  checkboxCell: {
    fontWeight: "bold",
  },
  titleCell: {
    fontWeight: 600,
    color: "#555",
  },
  descriptionCell: {
    fontStyle: "italic",
    color: "#888",
  },
  dueDateCell: {
    fontStyle: "italic",
    color: "#e69500",
  },
   button: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};

export default UserDashboard;
