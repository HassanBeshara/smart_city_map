import express from 'express';
import Marker, { CATEGORIES } from '../models/Marker.js';
import User from '../models/User.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function inferRegion(lat, lng) {
  if (lat >= 33.0 && lat <= 34.8 && lng >= 35.0 && lng <= 36.8) return 'lebanon';
  return 'nyc';
}

router.get('/categories', (_req, res) => {
  res.json(CATEGORIES);
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, status, region, lat, lng, radius = 50000 } = req.query;
    const filter = { status: status || { $in: ['active', 'pending'] } };

    if (region && region !== 'all') filter.region = region;
    if (category && category !== 'all') filter.category = category;
    if (search) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { address: { $regex: term, $options: 'i' } },
      ];
    }

    const useGeo = lat && lng;
    if (useGeo) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        },
      };
    }

    let query = Marker.find(filter).populate('createdBy', 'name email').limit(500);
    if (!useGeo) query = query.sort({ createdAt: -1 });

    const markers = await query;

    res.json(markers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/nearest', async (req, res) => {
  try {
    const { lat, lng, limit = 5, category, region } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const filter = {
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 25000,
        },
      },
    };
    if (region && region !== 'all') filter.region = region;
    if (category && category !== 'all') filter.category = category;

    const markers = await Marker.find(filter).limit(parseInt(limit, 10)).populate('createdBy', 'name');
    res.json(markers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/heatmap', async (_req, res) => {
  try {
    const points = await Marker.aggregate([
      { $match: { status: { $in: ['active', 'pending'] } } },
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] },
          },
          intensity: { $sum: '$reportCount' },
        },
      },
    ]);
    res.json(
      points.map((p) => ({
        lat: p._id.lat,
        lng: p._id.lng,
        intensity: p.intensity,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'createdBy', select: 'name' },
    });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/mine', protect, async (req, res) => {
  try {
    const markers = await Marker.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(markers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id).populate('createdBy', 'name email');
    if (!marker) return res.status(404).json({ message: 'Marker not found' });
    res.json(marker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, images, lat, lng, address, region } = req.body;
    if (!title || !category || lat == null || lng == null) {
      return res.status(400).json({ message: 'title, category, lat, lng required' });
    }

    const marker = await Marker.create({
      title,
      description,
      category,
      images: images || [],
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      address,
      region: region || inferRegion(parseFloat(lat), parseFloat(lng)),
      createdBy: req.user._id,
    });

    const populated = await marker.populate('createdBy', 'name email');
    const io = req.app.get('io');
    io?.emit('marker:created', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) return res.status(404).json({ message: 'Marker not found' });
    if (marker.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, images, lat, lng, address, region } = req.body;
    if (title) marker.title = title;
    if (description !== undefined) marker.description = description;
    if (category) marker.category = category;
    if (images) marker.images = images;
    if (address !== undefined) marker.address = address;
    if (region) marker.region = region;
    if (lat != null && lng != null) {
      marker.location.coordinates = [parseFloat(lng), parseFloat(lat)];
      if (!region) marker.region = inferRegion(parseFloat(lat), parseFloat(lng));
    }

    await marker.save();
    const populated = await marker.populate('createdBy', 'name email');
    req.app.get('io')?.emit('marker:updated', populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) return res.status(404).json({ message: 'Marker not found' });
    if (marker.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await marker.deleteOne();
    req.app.get('io')?.emit('marker:deleted', { _id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) return res.status(404).json({ message: 'Marker not found' });

    const user = await User.findById(req.user._id);
    const idx = user.favorites.indexOf(marker._id);
    if (idx > -1) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(marker._id);
    }
    await user.save();
    const updated = await User.findById(req.user._id).populate('favorites');
    res.json({ favorites: updated.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
