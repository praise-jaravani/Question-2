import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import actorRoutes from './routes/actorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const PORT = process.env.PORT || 8080;
const app = express();
dotenv.config();

connectDatabase().catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Actor Follow Backend is running successfully!'));

app.use('/api/auth', authRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend server is running on port: ${PORT}`));
}

export default app;
