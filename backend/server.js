require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { startScheduler } = require('./services/scheduler');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const platformRoutes = require('./routes/platformRoutes');

const User = require('./models/User');

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@meridian.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@meridian.com',
        password: 'password123',
        role: 'admin',
        isVerified: true,
      });
      console.log('Seeded default admin account: admin@meridian.com / password123');
    }

    const customerExists = await User.findOne({ email: 'customer@meridian.com' });
    if (!customerExists) {
      await User.create({
        name: 'Default Customer',
        email: 'customer@meridian.com',
        password: 'password123',
        role: 'customer',
        isVerified: true,
      });
      console.log('Seeded default customer account: customer@meridian.com / password123');
    }
  } catch (err) {
    console.error('Error seeding users:', err.message);
  }
};

connectDB().then(() => {
  seedUsers();
});

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/platforms', platformRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startScheduler();
  });
}

module.exports = app;
