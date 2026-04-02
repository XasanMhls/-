import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\x1b[32m✔ MongoDB connected: ${conn.connection.host}\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31m✘ MongoDB connection error: ${err.message}\x1b[0m`);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});
