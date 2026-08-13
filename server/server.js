// server.js
//
// Entry point used in production (and by `npm start`). Connects to
// MongoDB (MongoDB Atlas in production, per the checkpoint - Azure has
// no built-in MongoDB service) and starts listening.
//
// Azure-readiness point 1: never hardcode the port - Azure assigns one
// via the PORT environment variable at runtime.

require('dotenv').config();
const mongoose = require('mongoose');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_azure_checkpoint';

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
