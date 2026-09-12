const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/syncspace');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

