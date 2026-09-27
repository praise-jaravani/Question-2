import Movie from '../models/Movie.js';
import { notifyFollowers } from '../utils/notify.js';

export const createMovie = async (req, res) => {
  try {
    const { title, genre, releaseDate, actors } = req.body;
    if (!title || !releaseDate || !actors || actors.length === 0) {
      return res
        .status(400)
        .json({ message: 'Title, release date and at least one actor are required' });
    }

    const movie = new Movie({
      title,
      genre: genre || '',
      releaseDate,
      actors
    });

    await movie.save();
    await notifyFollowers(movie);

    res.status(201).json({ message: 'Movie added', movie });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ message: 'Server error while adding movie' });
  }
};
