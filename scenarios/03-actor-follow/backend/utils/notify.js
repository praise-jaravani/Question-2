import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';

// Notifies the followers of the movie's cast that a new movie is out.
export const notifyFollowers = async (movie) => {
  const follows = await Follow.find({ actor: { $in: movie.actors } }).populate('actor', 'name');

  const notifications = [];
  for (const follow of follows) {
    notifications.push({
      user: follow.user,
      movie: movie._id,
      actor: follow.actor._id,
      message: `${follow.actor.name} is in a new movie: ${movie.title}`
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};
