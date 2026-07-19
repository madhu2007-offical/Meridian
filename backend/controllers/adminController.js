const User = require('../models/User');
const Post = require('../models/Post');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry').sort({ createdAt: -1 });
    res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      posts: posts.map((p) => ({
        ...p.toObject(),
        author: { _id: p.author._id, name: p.author.name, email: p.author.email },
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
