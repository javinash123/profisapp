import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: mongoose.Schema.Types.Mixed, required: true },
  summary: { type: String },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

MatchSchema.pre('save', function(next: any) {
  (this as any).updatedAt = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);
