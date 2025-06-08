const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({username});
    if(existingUser) return res.status(401).json({message:"username not available"})
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password: enteredPassword } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    } else if(!(await user.comparePassword(enteredPassword))){
      return res.status(401).json({message: "Invalid credentiala"})
    }
    const token = generateToken(user);
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};