import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genre: { type: String, trim: true, default: '' },
    releaseDate: { type: Date, required: true },
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }]
  },
  { timestamps: true, collection: 'movies' }
);

movieSchema.statics.findForActors = function (actorIds) {
  return this.find({})
    .populate('actors', 'name')
    .sort({ releaseDate: 1 });
};

export default mongoose.model('Movie', movieSchema);
