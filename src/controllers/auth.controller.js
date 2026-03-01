const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email });
  if (!user || !user.isActive || user.deletedAt) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user._id);
  res.json({ token });
};

exports.getMe = async (req, res) => {
  res.json({ user: { email: req.user.email, name: req.user.name, role: req.user.role } });
};
