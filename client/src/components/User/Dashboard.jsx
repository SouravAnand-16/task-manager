import { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  fetchTasks,
  bulkUpdateTaskStatus,
  createTask,
} from "../../../src/utils/util";

const PAGE_SIZE = 5;

const UserDashboard = () => {
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

  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null); 
  // Filters
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selected tasks IDs (across pages)
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

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
      setNewTask({ title: "", description: "", dueDate: ""});
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
      const data = await fetchTasks(page, PAGE_SIZE);
      setTasks(data.tasks);
      setTasksTotalPages(Math.ceil(data.total / PAGE_SIZE));
      setTasksPage(page);
    } catch (err) {
      console.error("Error loading tasks:", err);
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
  const handleBulkTaskStatus = async (newStatus) => {
    if (selectedTaskIds.size === 0) return alert("Select tasks to update");
    try {
      await bulkUpdateTaskStatus(Array.from(selectedTaskIds), newStatus);
      alert("Tasks updated");
      loadTasks(tasksPage);
      setSelectedTaskIds(new Set());
    } catch (err) {
      console.error("Error updating tasks:", err);
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
      User Dashboard
      {/* Tasks Section */}
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 1,
          maxWidth: "30%",
        }}
      >
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          + Create Task
        </Button>
      </Box>
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
                <TableCell>
                  {task.completed ? "Completed" : "Pending"}
                </TableCell>
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
