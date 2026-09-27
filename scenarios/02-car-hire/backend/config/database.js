import mongoose from 'mongoose';

const dbName = process.env.NODE_ENV === 'test' ? 'CarHireDB_Test_8825541' : 'CarHireDB';
const fallback = `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;
const connectionString = process.env.NODE_ENV === 'test' ? fallback : process.env.MONGODB_URI || fallback;

const connectDatabase = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Connected to MongoDB with Mongoose (Database: ${dbName})`);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDatabase;
