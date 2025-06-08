const express = require('express');
const router = express.Router();
const { createTask, getTasks, bulkUpdateTasks, updateTask } = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/bulk', auth, bulkUpdateTasks);
router.patch('/:taskId', auth, updateTask);

module.exports = router;