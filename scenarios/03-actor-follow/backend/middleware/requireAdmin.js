import User from '../models/User.js';

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (user.role = 'admin') {
      return next();
    }

    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error while checking permissions' });
  }
};

export default requireAdmin;
