import mongoose from 'mongoose';
import Actor from '../models/Actor.js';
import Follow from '../models/Follow.js';

export const getAllActors = async (req, res) => {
  try {
    const actors = await Actor.findAll();
    res.status(200).json({ actors });
  } catch (error) {
    console.error('Get actors error:', error);
    res.status(500).json({ message: 'Server error while fetching actors' });
  }
};

export const getActorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid actor ID' });
    }

    const actor = await Actor.findById(id);
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    const userId = req.headers['x-user-id'];
    let isFollowing = false;
    if (userId) {
      const follow = await Follow.findOne({ user: userId, actor: actor._id });
      isFollowing = Boolean(follow);
    }

    res.status(200).json({ actor, isFollowing });
  } catch (error) {
    console.error('Get actor error:', error);
    res.status(500).json({ message: 'Server error while fetching actor' });
  }
};
