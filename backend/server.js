require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

let MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (MONGODB_URI.includes('cluster0.ancbtjx.mongodb.net')) {
    console.log('Detected problematic Atlas URI. Using mongodb-memory-server instead...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
    } catch (e) {
      console.error('Failed to create in-memory server', e);
    }
  }

  mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err.message));
}

connectDB();

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected. Mongoose will retry...'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected!'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/messages', require('./routes/messages'));

const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// restart nodemon
