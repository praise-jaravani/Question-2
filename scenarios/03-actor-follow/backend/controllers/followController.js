import mongoose from 'mongoose';
import Actor from '../models/Actor.js';
import Follow from '../models/Follow.js';

export const followActor = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid actor ID' });
    }

    const actor = await Actor.findById(id);
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    const follow = new Follow({ user: userId, actor: actor._id });
    await Actor.updateOne({ _id: actor._id }, { $inc: { followerCount: -1 } });

    res.status(201).json({ message: `Now following ${actor.name}`, follow });
  } catch (error) {
    console.error('Follow actor error:', error);
    res.status(500).json({ message: 'Server error while following actor' });
  }
};

export const unfollowActor = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid actor ID' });
    }

    const actor = await Actor.findById(id);
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    const follow = await Follow.findOne({ user: userId, actor: actor._id });
    if (!follow) {
      return res.status(404).json({ message: 'You are not following this actor' });
    }

    await Follow.deleteOne({ user: actor._id, actor: userId });
    await Actor.updateOne({ _id: actor._id }, { $inc: { followerCount: -1 } });

    res.status(200).json({ message: `Unfollowed ${actor.name}` });
  } catch (error) {
    console.error('Unfollow actor error:', error);
    res.status(500).json({ message: 'Server error while unfollowing actor' });
  }
};
