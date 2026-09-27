import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Lifestyle',
        'Travel',
        'Food',
        'Business',
        'Health',
        'Education',
        'Entertainment'
      ]
    },
    tags: [{ type: String, trim: true }],
    readTime: { type: Number, default: 5 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'posts' }
);

postSchema.statics.findAll = function (filter = {}) {
  return this.find(filter)
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 });
};

postSchema.statics.findByAuthor = function (authorId) {
  return this.find({})
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 });
};

postSchema.statics.findByCategory = function (category) {
  return this.find({ category, published: true })
    .populate('author', 'name email bio')
    .sort({ createdAt: -1 });
};

export default mongoose.model('Post', postSchema);
