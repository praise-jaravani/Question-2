import express from 'express';
import { getAllActors, getActorById } from '../controllers/actorController.js';
import { followActor, unfollowActor } from '../controllers/followController.js';

const router = express.Router();

router.get('/', getAllActors);
router.get('/:id', getActorById);
router.post('/:id/follow', followActor);
router.delete('/:id/follow', unfollowActor);

export default router;
