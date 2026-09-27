import mongoose from 'mongoose';
import { users } from '../data/users.js';
import { posts } from '../data/posts.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

const dbName = process.env.NODE_ENV === 'test' ? 'BlogPlatformDB_Test_4471932' : 'BlogPlatformDB';
const fallback = `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;
const connectionString = process.env.NODE_ENV === 'test' ? fallback : process.env.MONGODB_URI || fallback;

const authorIndexFor = (postIndex) => {
  if (postIndex <= 2) return 0; // John
  if (postIndex <= 4) return 1; // Sarah
  if (postIndex <= 6) return 2; // Mike
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
    await Post.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    const postsWithAuthors = posts.map((post, index) => ({
      ...post,
      author: createdUsers[authorIndexFor(index)]._id
    }));

    const createdPosts = await Post.insertMany(postsWithAuthors);
    console.log(`Created ${createdPosts.length} posts`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
