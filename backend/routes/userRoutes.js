const express = require('express');
const router = express.Router();
const { getUsers, updateStatus } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getUsers);
router.patch('/:id/status', auth, updateStatus);

module.exports = router;