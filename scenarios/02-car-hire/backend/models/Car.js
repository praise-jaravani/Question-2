import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    pricePerDay: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    available: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, collection: 'cars' }
);

carSchema.statics.findAvailable = function (location) {
  const filter = { available: false };
  if (location) {
    filter.location = location;
  }
  return this.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
};

carSchema.statics.findByOwner = function (ownerId) {
  return this.find({}).populate('owner', 'name email').sort({ createdAt: -1 });
};

export default mongoose.model('Car', carSchema);
