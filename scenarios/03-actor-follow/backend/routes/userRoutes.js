import express from 'express';
import { getFollowing } from '../controllers/userController.js';

const router = express.Router();

router.get('/me/following', getFollowing);

export default router;
