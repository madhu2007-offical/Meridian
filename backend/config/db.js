const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  // If MONGO_URI is missing or points to localhost/127.0.0.1, check if local MongoDB is running,
  // and if not, fallback to mongodb-memory-server
  if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    try {
      console.log('Attempting to connect to local MongoDB...');
      await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/post_composer', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`MongoDB connected locally: ${mongoose.connection.host}`);
      return;
    } catch (localErr) {
      console.warn('Local MongoDB not running. Starting in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log(`In-memory MongoDB server started successfully.`);
      } catch (memServerErr) {
        console.error('Failed to start in-memory MongoDB server:', memServerErr.message);
        process.exit(1);
      }
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
