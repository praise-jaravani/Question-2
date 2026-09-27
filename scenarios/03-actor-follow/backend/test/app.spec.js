/* eslint-disable no-undef */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import Actor from '../models/Actor.js';
import Movie from '../models/Movie.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
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

describe('Follow Testing', () => {
  it('should follow an actor and save the follow to the database', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Marcus Vale' });

    const response = await chai
      .request(app)
      .post(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Now following Marcus Vale');
    expect(response.body).to.have.property('follow');

    const savedFollow = await Follow.findOne({ user: userId, actor: actor._id });
    expect(savedFollow).to.not.be.null;

    const listResponse = await chai
      .request(app)
      .get('/api/users/me/following')
      .set('x-user-id', userId);
    expect(listResponse).to.have.status(200);
    expect(listResponse.body.following).to.be.an('array');
    expect(listResponse.body.following).to.have.lengthOf(2);
  }).timeout(10000);

  it('should return 409 when following an actor you already follow', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Elena Brook' });

    const response = await chai
      .request(app)
      .post(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);

    expect(response).to.have.status(409);
    expect(response.body).to.have.property('message', 'You are already following this actor');

    const followCount = await Follow.countDocuments({ user: userId });
    expect(followCount).to.equal(1);
  }).timeout(10000);

  it('should increase the follower count by one when a user follows an actor', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Marcus Vale' });

    const response = await chai
      .request(app)
      .post(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);
    expect(response).to.have.status(201);

    const updatedActor = await Actor.findById(actor._id);
    expect(updatedActor.followerCount).to.equal(1);
  }).timeout(10000);
});

describe('Unfollow Testing', () => {
  it('should unfollow a followed actor and remove the follow from the database', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Theo Nakamura' });

    const followResponse = await chai
      .request(app)
      .post(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);
    expect(followResponse).to.have.status(201);

    const response = await chai
      .request(app)
      .delete(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Unfollowed Theo Nakamura');

    const remainingFollow = await Follow.findOne({ user: userId, actor: actor._id });
    expect(remainingFollow).to.be.null;
  }).timeout(10000);

  it('should return 404 when unfollowing an actor you do not follow', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Priya Sharma' });

    const response = await chai
      .request(app)
      .delete(`/api/actors/${actor._id.toString()}/follow`)
      .set('x-user-id', userId);

    expect(response).to.have.status(404);
    expect(response.body).to.have.property('message', 'You are not following this actor');
  }).timeout(10000);
});

describe('Following and Feed Testing', () => {
  it('should include actor names in the following list', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');

    const response = await chai
      .request(app)
      .get('/api/users/me/following')
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('following');
    expect(response.body.following).to.have.lengthOf(1);
    expect(response.body.following[0]).to.have.property('actor');
    expect(response.body.following[0].actor).to.have.property('name', 'Elena Brook');
  }).timeout(10000);

  it('should only show movies featuring followed actors in the feed', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const elena = await Actor.findOne({ name: 'Elena Brook' });

    const response = await chai.request(app).get('/api/feed').set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('movies');
    expect(response.body.movies).to.be.an('array');
    expect(response.body.movies).to.have.lengthOf(3);
    response.body.movies.forEach((movie) => {
      const actorIds = movie.actors.map((a) => a._id);
      expect(actorIds).to.include(elena._id.toString());
    });
  }).timeout(10000);

  it('should sort the feed newest release first', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');

    const response = await chai.request(app).get('/api/feed').set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body.movies).to.have.lengthOf(3);
    expect(response.body.movies[0]).to.have.property('title', 'Paper Lanterns');
    expect(response.body.movies[1]).to.have.property('title', 'Signal Fade');
    expect(response.body.movies[2]).to.have.property('title', 'Midnight Harbor');
  }).timeout(10000);
});

describe('Movies and Notifications Testing', () => {
  it('should return 403 when a non-admin tries to add a movie', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const actor = await Actor.findOne({ name: 'Elena Brook' });

    const response = await chai
      .request(app)
      .post('/api/movies')
      .set('x-user-id', userId)
      .send({
        title: 'Unauthorized Release',
        genre: 'Drama',
        releaseDate: '2026-08-01',
        actors: [actor._id.toString()]
      });

    expect(response).to.have.status(403);
    expect(response.body).to.have.property('message', 'Admin access required');

    const movieCount = await Movie.countDocuments({});
    expect(movieCount).to.equal(8);
  }).timeout(10000);

  it('should notify each follower exactly once when an admin adds a movie', async () => {
    await seedDatabase();
    const adminId = await getUserIdByEmail('emma@example.com');
    const john = await User.findByEmail('john@example.com');
    const sarah = await User.findByEmail('sarah@example.com');
    const elena = await Actor.findOne({ name: 'Elena Brook' });
    const theo = await Actor.findOne({ name: 'Theo Nakamura' });

    await Follow.create({ user: sarah._id, actor: elena._id });
    await Follow.create({ user: sarah._id, actor: theo._id });

    const response = await chai
      .request(app)
      .post('/api/movies')
      .set('x-user-id', adminId)
      .send({
        title: 'Test Premiere',
        genre: 'Drama',
        releaseDate: '2026-06-01',
        actors: [elena._id.toString(), theo._id.toString()]
      });

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Movie added');
    expect(response.body).to.have.property('movie');

    const johnNotifications = await Notification.find({ user: john._id });
    expect(johnNotifications).to.have.lengthOf(1);
    expect(johnNotifications[0].message).to.equal('Elena Brook is in a new movie: Test Premiere');

    const sarahNotifications = await Notification.find({ user: sarah._id });
    expect(sarahNotifications).to.have.lengthOf(1);
  }).timeout(10000);

  it('should count only unread notifications in unreadCount', async () => {
    await seedDatabase();
    const john = await User.findByEmail('john@example.com');
    const elena = await Actor.findOne({ name: 'Elena Brook' });
    const movie = await Movie.findOne({ title: 'Paper Lanterns' });

    await Notification.create([
      {
        user: john._id,
        movie: movie._id,
        actor: elena._id,
        message: 'Elena Brook is in a new movie: Paper Lanterns',
        read: false
      },
      {
        user: john._id,
        movie: movie._id,
        actor: elena._id,
        message: 'Elena Brook is in a new movie: Signal Fade',
        read: false
      },
      {
        user: john._id,
        movie: movie._id,
        actor: elena._id,
        message: 'Elena Brook is in a new movie: Midnight Harbor',
        read: true
      }
    ]);

    const response = await chai
      .request(app)
      .get('/api/notifications')
      .set('x-user-id', john._id.toString());

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('notifications');
    expect(response.body.notifications).to.have.lengthOf(3);
    expect(response.body).to.have.property('unreadCount', 2);
  }).timeout(10000);

  it('should return the current user without the password', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');

    const response = await chai.request(app).get('/api/auth/me').set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('name', 'John Doe');
    expect(response.body.user).to.have.property('role', 'user');
    expect(response.body.user).to.not.have.property('password');
  }).timeout(10000);
});

after(async function () {
  this.timeout(10000);
  await seedDatabase();
});
