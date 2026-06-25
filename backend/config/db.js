const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is already in progress, await it
  if (cachedPromise) {
    return cachedPromise;
  }

  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shortlink';
  if (uri.startsWith('mongodb://') && uri.includes('.mongodb.net')) {
    console.warn('Auto-correcting MONGO_URI protocol typo from mongodb:// to mongodb+srv://');
    uri = uri.replace('mongodb://', 'mongodb+srv://');
  }
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000, // Fail fast if Atlas firewall blocks the IP
    socketTimeoutMS: 45000,
  };

  console.log('Connecting to MongoDB...');
  cachedPromise = mongoose.connect(uri, options)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`MongoDB Connection Error: ${error.message}`);
      cachedPromise = null; // Clear cached promise on failure to allow retry
      throw error; // Let the caller handle the error
    });

  return cachedPromise;
};

module.exports = connectDB;
