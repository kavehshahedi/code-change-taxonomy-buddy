const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbName = process.env.DB_NAME || 'cctb';
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbProtocol = process.env.DB_PROTOCOL || 'mongodb+srv';
    
    await mongoose.connect(`${dbProtocol}://${dbUsername}:${dbPassword}@${dbHost}`, {
      dbName: dbName,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;