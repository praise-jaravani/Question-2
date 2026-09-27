import mongoose from 'mongoose';
import { users } from '../data/users.js';
import { cars } from '../data/cars.js';
import { bookings } from '../data/bookings.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

const dbName = process.env.NODE_ENV === 'test' ? 'CarHireDB_Test_8825541' : 'CarHireDB';
const fallback = `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;
const connectionString = process.env.NODE_ENV === 'test' ? fallback : process.env.MONGODB_URI || fallback;

const ownerIndexFor = (carIndex) => {
  if (carIndex <= 2) return 0; // John
  if (carIndex <= 4) return 1; // Sarah
  if (carIndex <= 6) return 2; // Mike
  return 3; // Emma
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    const carsWithOwners = cars.map((car, index) => ({
      ...car,
      owner: createdUsers[ownerIndexFor(index)]._id
    }));

    const createdCars = await Car.insertMany(carsWithOwners);
    console.log(`Created ${createdCars.length} cars`);

    const bookingsWithRefs = bookings.map(({ carIndex, renterIndex, ...booking }) => ({
      ...booking,
      car: createdCars[carIndex]._id,
      renter: createdUsers[renterIndex]._id
    }));

    const createdBookings = await Booking.insertMany(bookingsWithRefs);
    console.log(`Created ${createdBookings.length} bookings`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
