import express from 'express';
import {
  getAllCars,
  getMyCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleAvailability
} from '../controllers/carController.js';
import { createBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getAllCars);
router.get('/my-cars', getMyCars);
router.get('/:id', getCarById);
router.post('/', createCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);
router.patch('/:id/availability', toggleAvailability);
router.post('/:id/bookings', createBooking);

export default router;
