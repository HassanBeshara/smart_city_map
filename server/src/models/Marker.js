import mongoose from 'mongoose';

export const CATEGORIES = [
  'restaurant',
  'hospital',
  'parking',
  'event',
  'issue',
  'other',
];

const markerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true },
    images: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, default: '' },
    region: { type: String, enum: ['nyc', 'lebanon'], default: 'nyc' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'pending', 'resolved', 'rejected'], default: 'active' },
    reportCount: { type: Number, default: 1 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

markerSchema.index({ location: '2dsphere' });
markerSchema.index({ title: 'text', description: 'text', address: 'text' });

export default mongoose.model('Marker', markerSchema);
