import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true, collection: 'users' }
);

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.methods.toPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);
