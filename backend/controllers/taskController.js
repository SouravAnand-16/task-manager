const Task = require('../models/Task');


// Create Task — handles both Admin and User
exports.createTask = async (req, res) => {
  const { title, description, dueDate, assignedTo } = req.body;

  try {
    let taskData = { title, description, dueDate };

    if (req.user.role === 'admin') {
      if (!assignedTo) {
        return res.status(400).json({ message: 'assignedTo is required when admin creates task' });
      }
      taskData.assignedTo = assignedTo;
    } else {
      taskData.assignedTo = req.user._id;
    }
    const task = new Task(taskData);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get Tasks — Admin sees all, User sees their own
exports.getTasks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.json({ tasks, total, page, limit });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};


exports.bulkUpdateTasks = async (req, res) => {
  const { taskIds, updateData } = req.body;
  await Task.updateMany({ _id: { $in: taskIds } }, updateData);
  res.json({ message: 'Tasks updated' });
};