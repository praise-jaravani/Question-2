import mongoose from 'mongoose';

const actorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    followerCount: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'actors' }
);

actorSchema.statics.findAll = function () {
  return this.find({}).sort({ name: 1 });
};

export default mongoose.model('Actor', actorSchema);
