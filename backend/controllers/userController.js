const User = require('../models/User');

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied: Only admins can view users" });
    }
    const users = await User.find({}, '-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({ users, total, page, limit });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Only admins can change status' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot change status of another admin' });
    }

    user.status = status;
    user.tokenVersion += 1; 
    await user.save();

    res.json({ message: 'User status updated and sessions invalidated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};