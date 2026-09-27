import express from 'express';
import requireAdmin from '../middleware/requireAdmin.js';
import { createMovie } from '../controllers/movieController.js';

const router = express.Router();

router.post('/', requireAdmin, createMovie);

export default router;
