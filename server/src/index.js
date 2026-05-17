import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import markerRoutes from './routes/markers.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const app = express();
const httpServer = createServer(app);

const publicUrl =
  process.env.CLIENT_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (isProd ? undefined : 'http://localhost:5173');

const extraClientOrigins = (process.env.CLIENT_URLS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const explicitCorsOrigins = [...new Set([publicUrl, ...extraClientOrigins].filter(Boolean))];

function isTunnelOrLocalOrigin(origin) {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.endsWith('.trycloudflare.com')) return true;
  } catch {
    return false;
  }
  return false;
}

const corsOriginCallback = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (explicitCorsOrigins.includes(origin)) return callback(null, true);
  if (isTunnelOrLocalOrigin(origin)) return callback(null, true);
  callback(null, false);
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginCallback,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({ origin: corsOriginCallback, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('location:update', (data) => {
    socket.broadcast.emit('user:location', { socketId: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user:disconnected', { socketId: socket.id });
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-map';

if (!process.env.MONGODB_URI && isProd) {
  console.error(
    'MONGODB_URI is not set. In Render: open your Web Service → Environment (not only an Environment Group) → add MONGODB_URI with your Atlas connection string.'
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
      if (publicUrl) console.log(`App URL: ${publicUrl}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    if (/authentication failed|bad auth/i.test(err.message)) {
      console.error('Check Atlas username/password in MONGODB_URI. URL-encode special characters in the password.');
    }
    process.exit(1);
  });
