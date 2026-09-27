import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
  },
  { timestamps: true, collection: 'bookings' }
);

bookingSchema.statics.findOverlapping = function (carId, start, end) {
  return this.find({
    car: carId,
    status: 'confirmed',
    startDate: { $lt: end },
    endDate: { $gt: start }
  });
};

bookingSchema.statics.findByRenter = function (renterId) {
  return this.find({ renter: renterId }).populate('car').sort({ createdAt: -1 });
};

export default mongoose.model('Booking', bookingSchema);
