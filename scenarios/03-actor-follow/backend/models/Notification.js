import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'notifications' }
);

export default mongoose.model('Notification', notificationSchema);
