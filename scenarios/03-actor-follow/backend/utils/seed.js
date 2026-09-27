import mongoose from 'mongoose';
import { users } from '../data/users.js';
import { actors } from '../data/actors.js';
import { movies } from '../data/movies.js';
import User from '../models/User.js';
import Actor from '../models/Actor.js';
import Movie from '../models/Movie.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';

const dbName = process.env.NODE_ENV === 'test' ? 'ActorFollowDB_Test_6203817' : 'ActorFollowDB';
const fallback = `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;
const connectionString = process.env.NODE_ENV === 'test' ? fallback : process.env.MONGODB_URI || fallback;

const seedDatabase = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Actor.deleteMany({});
    await Movie.deleteMany({});
    await Follow.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    const createdActors = await Actor.insertMany(actors);
    console.log(`Created ${createdActors.length} actors`);

    const moviesWithActors = movies.map(({ actorIndexes, ...movie }) => ({
      ...movie,
      actors: actorIndexes.map((index) => createdActors[index]._id)
    }));

    const createdMovies = await Movie.insertMany(moviesWithActors);
    console.log(`Created ${createdMovies.length} movies`);

    // John already follows Elena Brook, matching her seeded follower count.
    const createdFollows = await Follow.insertMany([
      { user: createdUsers[0]._id, actor: createdActors[1]._id }
    ]);
    console.log(`Created ${createdFollows.length} follows`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
