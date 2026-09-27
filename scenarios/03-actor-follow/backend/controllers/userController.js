import Follow from '../models/Follow.js';

export const getFollowing = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const following = await Follow.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error while fetching followed actors' });
  }
};
