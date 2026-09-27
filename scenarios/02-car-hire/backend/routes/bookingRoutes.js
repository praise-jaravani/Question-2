import express from 'express';
import { getMyBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/my-bookings', getMyBookings);

export default router;
