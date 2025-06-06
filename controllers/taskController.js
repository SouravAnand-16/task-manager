const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;
  console.log(req.user)
  const assignedTo = req.user._id;
  const task = new Task({ title, description, dueDate, assignedTo });
  await task.save();
  res.status(201).json(task);
};

exports.getTasks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const tasks = await Task.find().skip(skip).limit(limit);
  const total = await Task.countDocuments();
  res.json({ tasks, total });
};

exports.bulkUpdateTasks = async (req, res) => {
  const { taskIds, updateData } = req.body;
  await Task.updateMany({ _id: { $in: taskIds } }, updateData);
  res.json({ message: 'Tasks updated' });
};