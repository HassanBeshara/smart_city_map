import express from 'express';
import Marker from '../models/Marker.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (_req, res) => {
  try {
    const [totalMarkers, totalUsers, byCategory, byStatus, recentMarkers] = await Promise.all([
      Marker.countDocuments(),
      User.countDocuments(),
      Marker.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Marker.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Marker.find().sort({ createdAt: -1 }).limit(10).populate('createdBy', 'name'),
    ]);

    res.json({
      totalMarkers,
      totalUsers,
      byCategory: Object.fromEntries(byCategory.map((c) => [c._id, c.count])),
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      recentMarkers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Marker.deleteMany({ createdBy: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/markers', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const markers = await Marker.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(markers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/markers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const marker = await Marker.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'createdBy',
      'name'
    );
    req.app.get('io')?.emit('marker:updated', marker);
    res.json(marker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
