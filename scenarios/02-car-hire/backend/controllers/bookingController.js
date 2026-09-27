import mongoose from 'mongoose';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

export const createBooking = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid car ID' });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (car.owner === userId) {
      return res.status(400).json({ message: 'You cannot book your own car' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'Car is not available' });
    }

    const overlapping = await Booking.findOverlapping(car._id, start, end);
    if (overlapping.length > 0) {
      return res.status(409).json({ message: 'Car is already booked for these dates' });
    }

    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = nights * car.pricePerDay;

    const booking = new Booking({
      car: car._id,
      renter: userId,
      startDate: start,
      endDate: end,
      totalPrice
    });

    await booking.save();
    await booking.populate('car');

    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const bookings = await Booking.findByRenter(userId);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching your bookings' });
  }
};
