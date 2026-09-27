/* eslint-disable no-undef */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import { exec } from 'child_process';

chai.use(chaiHttp);
const { expect } = chai;

const seedDatabase = () =>
  new Promise((resolve, reject) => {
    exec('node utils/seed.js', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });

const getUserIdByEmail = async (email) => {
  const user = await User.findByEmail(email);
  return user._id.toString();
};

describe('Car Listing Testing', () => {
  it('should list a car with the expected response structure and a numeric price', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const carData = {
      make: 'Nissan',
      model: 'Qashqai',
      year: 2022,
      pricePerDay: 500,
      location: 'Cape Town',
      description: 'A test listing'
    };
    const response = await chai
      .request(app)
      .post('/api/cars')
      .set('x-user-id', userId)
      .send(carData);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Car listed successfully');
    expect(response.body).to.have.property('car');
    const car = response.body.car;
    expect(car).to.have.property('make', carData.make);
    expect(car).to.have.property('model', carData.model);
    expect(car).to.have.property('year', carData.year);
    expect(car).to.have.property('pricePerDay', carData.pricePerDay);
    expect(car.pricePerDay).to.be.a('number');
    expect(car).to.have.property('location', carData.location);
    expect(car).to.have.property('available', true);
    expect(car).to.have.property('owner');
  }).timeout(10000);

  it('should save a listed car to the database and show it in My Cars', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const carData = {
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      pricePerDay: 600,
      location: 'Cape Town',
      description: 'Another test listing'
    };
    const createResponse = await chai
      .request(app)
      .post('/api/cars')
      .set('x-user-id', userId)
      .send(carData);
    expect(createResponse).to.have.status(201);
    const createdCarId = createResponse.body.car._id;

    const savedCar = await Car.findById(createdCarId);
    expect(savedCar).to.not.be.null;
    expect(savedCar.make).to.equal(carData.make);
    expect(savedCar.pricePerDay).to.equal(carData.pricePerDay);

    const myCarsResponse = await chai
      .request(app)
      .get('/api/cars/my-cars')
      .set('x-user-id', userId);
    expect(myCarsResponse).to.have.status(200);
    expect(myCarsResponse.body.cars).to.be.an('array');
    const foundCar = myCarsResponse.body.cars.find((c) => c._id === createdCarId);
    expect(foundCar).to.not.be.undefined;
    expect(foundCar.model).to.equal(carData.model);
  }).timeout(10000);

  it('should return only the logged-in user\'s cars on My Cars', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');

    const response = await chai
      .request(app)
      .get('/api/cars/my-cars')
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('cars');
    expect(response.body.cars).to.be.an('array');
    expect(response.body.cars).to.have.lengthOf(3);
    response.body.cars.forEach((car) => {
      expect(car.owner).to.have.property('_id', userId);
      expect(car.owner).to.have.property('name', 'John Doe');
    });
  }).timeout(10000);
});

describe('Car Browsing Testing', () => {
  it('should return only available cars on the public list', async () => {
    await seedDatabase();

    const response = await chai.request(app).get('/api/cars');

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('cars');
    expect(response.body.cars).to.be.an('array');
    expect(response.body.cars).to.have.lengthOf(7);
    response.body.cars.forEach((car) => {
      expect(car).to.have.property('available', true);
    });
    const unavailable = response.body.cars.find((c) => c.model === 'C-Class');
    expect(unavailable).to.be.undefined;
  }).timeout(10000);

  it('should filter cars by location case-insensitively', async () => {
    await seedDatabase();

    const response = await chai.request(app).get('/api/cars').query({ location: 'cape town' });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('cars');
    expect(response.body.cars).to.be.an('array');
    expect(response.body.cars).to.have.lengthOf(4);
    response.body.cars.forEach((car) => {
      expect(car).to.have.property('location', 'Cape Town');
      expect(car).to.have.property('available', true);
    });
  }).timeout(10000);
});

describe('Car Update and Availability Testing', () => {
  it('should let the owner update a car and save the changes', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });
    const updates = { pricePerDay: 550, description: 'Freshly serviced with new tyres' };

    const response = await chai
      .request(app)
      .put(`/api/cars/${car._id.toString()}`)
      .set('x-user-id', userId)
      .send(updates);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Car updated successfully');
    expect(response.body).to.have.property('car');
    expect(response.body.car).to.have.property('pricePerDay', updates.pricePerDay);
    expect(response.body.car).to.have.property('description', updates.description);

    const savedCar = await Car.findById(car._id);
    expect(savedCar.pricePerDay).to.equal(updates.pricePerDay);
    expect(savedCar.description).to.equal(updates.description);
  }).timeout(10000);

  it('should return 403 when a user tries to update someone else\'s car', async () => {
    await seedDatabase();
    const sarahId = await getUserIdByEmail('sarah@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });

    const response = await chai
      .request(app)
      .put(`/api/cars/${car._id.toString()}`)
      .set('x-user-id', sarahId)
      .send({ pricePerDay: 1 });

    expect(response).to.have.status(403);
    expect(response.body).to.have.property('message', 'Not authorized to update this car');

    const savedCar = await Car.findById(car._id);
    expect(savedCar.pricePerDay).to.equal(400);
  }).timeout(10000);

  it('should toggle availability, return the car, and save the change', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });

    const response = await chai
      .request(app)
      .patch(`/api/cars/${car._id.toString()}/availability`)
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Availability updated');
    expect(response.body).to.have.property('car');
    expect(response.body.car).to.have.property('available', false);

    const savedCar = await Car.findById(car._id);
    expect(savedCar.available).to.equal(false);
  }).timeout(10000);
});

describe('Booking Testing', () => {
  it('should price a booking as nights times price per day', async () => {
    await seedDatabase();
    const sarahId = await getUserIdByEmail('sarah@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });

    const response = await chai
      .request(app)
      .post(`/api/cars/${car._id.toString()}/bookings`)
      .set('x-user-id', sarahId)
      .send({ startDate: '2030-03-10', endDate: '2030-03-15' });

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Booking confirmed');
    expect(response.body).to.have.property('booking');
    expect(response.body.booking).to.have.property('totalPrice', 2000);

    const savedBooking = await Booking.findById(response.body.booking._id);
    expect(savedBooking).to.not.be.null;
    expect(savedBooking.totalPrice).to.equal(2000);
  }).timeout(10000);

  it('should not let a user book their own car', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });

    const response = await chai
      .request(app)
      .post(`/api/cars/${car._id.toString()}/bookings`)
      .set('x-user-id', userId)
      .send({ startDate: '2030-05-01', endDate: '2030-05-03' });

    expect(response).to.have.status(400);
    expect(response.body).to.have.property('message', 'You cannot book your own car');

    const bookings = await Booking.find({ car: car._id });
    expect(bookings).to.have.lengthOf(0);
  }).timeout(10000);

  it('should return 409 for overlapping booking dates', async () => {
    await seedDatabase();
    const mikeId = await getUserIdByEmail('mike@example.com');
    const car = await Car.findOne({ make: 'Toyota', model: 'Corolla' });

    const response = await chai
      .request(app)
      .post(`/api/cars/${car._id.toString()}/bookings`)
      .set('x-user-id', mikeId)
      .send({ startDate: '2030-01-12', endDate: '2030-01-14' });

    expect(response).to.have.status(409);
    expect(response.body).to.have.property('message', 'Car is already booked for these dates');

    const bookings = await Booking.find({ car: car._id });
    expect(bookings).to.have.lengthOf(1);
  }).timeout(10000);

  it('should reject a booking whose end date is not after its start date', async () => {
    await seedDatabase();
    const sarahId = await getUserIdByEmail('sarah@example.com');
    const car = await Car.findOne({ make: 'Volkswagen', model: 'Polo' });

    const response = await chai
      .request(app)
      .post(`/api/cars/${car._id.toString()}/bookings`)
      .set('x-user-id', sarahId)
      .send({ startDate: '2030-04-10', endDate: '2030-04-08' });

    expect(response).to.have.status(400);
    expect(response.body).to.have.property('message', 'End date must be after start date');

    const bookings = await Booking.find({ car: car._id });
    expect(bookings).to.have.lengthOf(0);
  }).timeout(10000);
});

after(async function () {
  this.timeout(10000);
  await seedDatabase();
});
