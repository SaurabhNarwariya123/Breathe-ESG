const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) {
        console.error('All connection attempts failed. Exiting.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
