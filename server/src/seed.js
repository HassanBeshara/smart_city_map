import mongoose from 'mongoose';
import User from './models/User.js';
import Marker from './models/Marker.js';
import { SAMPLE_PLACES, NYC_PLACES, LEBANON_PLACES } from './data/samplePlaces.js';
import { loadEnv } from './loadEnv.js';

loadEnv();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-map');

  await Marker.deleteMany({});
  await User.deleteMany({ email: { $in: ['admin@smartcity.com', 'demo@smartcity.com'] } });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@smartcity.com',
    password: 'admin123',
    role: 'admin',
  });

  const demo = await User.create({
    name: 'Demo User',
    email: 'demo@smartcity.com',
    password: 'demo123',
    role: 'user',
  });

  const creators = [admin._id, demo._id];

  for (let i = 0; i < SAMPLE_PLACES.length; i++) {
    const m = SAMPLE_PLACES[i];
    await Marker.create({
      title: m.title,
      description: m.description,
      category: m.category,
      address: m.address,
      region: m.region,
      location: { type: 'Point', coordinates: [m.lng, m.lat] },
      createdBy: creators[i % creators.length],
      reportCount: m.reportCount,
      status: 'active',
    });
  }

  console.log(
    `Seeded ${SAMPLE_PLACES.length} places (${NYC_PLACES.length} NYC + ${LEBANON_PLACES.length} Lebanon)`
  );
  console.log('Admin: admin@smartcity.com / admin123');
  console.log('Demo:  demo@smartcity.com / demo123');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
