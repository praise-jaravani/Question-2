import mongoose from 'mongoose';
import Car from '../models/Car.js';

export const getAllCars = async (req, res) => {
  try {
    const { location } = req.query;
    const cars = await Car.findAvailable(location);
    res.status(200).json({ cars });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
};

export const getMyCars = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const cars = await Car.findByOwner(userId);
    res.status(200).json({ cars });
  } catch (error) {
    console.error('Get my cars error:', error);
    res.status(500).json({ message: 'Server error while fetching your cars' });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid car ID' });
    }

    const car = await Car.findById(id).populate('owner', 'name email');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ car });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error while fetching car' });
  }
};

export const createCar = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { make, model, year, price, location, description } = req.body;
    if (!make || !model || !year || !location) {
      return res
        .status(400)
        .json({ message: 'Make, model, year, price per day and location are required' });
    }

    const car = new Car({
      make,
      model,
      year,
      pricePerDay: price,
      location,
      description: description || '',
      owner: userId
    });

    res.status(201).json({ message: 'Car listed successfully', car });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({ message: 'Server error while listing car' });
  }
};

export const updateCar = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid car ID' });
    }

    const car = await Car.findById(id).lean();
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    const { make, model, year, pricePerDay, location, description } = req.body;
    if (make) car.make = make;
    if (model) car.model = model;
    if (year !== undefined) car.year = year;
    if (pricePerDay !== undefined) car.pricePerDay = pricePerDay;
    if (location) car.location = location;
    if (description !== undefined) car.description = description;

    res.status(200).json({ message: 'Car updated successfully', car });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ message: 'Server error while updating car' });
  }
};

export const deleteCar = async (req, res) => {
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

    if (car.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await Car.findByIdAndDelete(id);

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error while deleting car' });
  }
};

export const toggleAvailability = async (req, res) => {
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

    if (car.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    car.available = !car.available;
    await car.save();

    res.status(201).json({ message: 'Availability updated' });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error while updating availability' });
  }
};
