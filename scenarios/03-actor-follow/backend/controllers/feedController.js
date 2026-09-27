import Follow from '../models/Follow.js';
import Movie from '../models/Movie.js';

export const getFeed = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const follows = await Follow.find({ user: userId });
    const actorIds = follows.map((follow) => follow.actor);

    const movies = await Movie.findForActors(actorIds);
    res.status(200).json({ movies });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error while fetching feed' });
  }
};
