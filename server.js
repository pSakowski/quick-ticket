const mongoose = require('mongoose');
const socket = require('socket.io');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const concertsRouter = require('./routes/concerts.routes');
const seatsRoutes = require('./routes/seats.routes');
const testimonialsRouter = require('./routes/testimonials.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/client/build')));

// API endpoints
app.use('/api/', concertsRouter);
app.use('/api/', seatsRoutes);
app.use('/api/', testimonialsRouter);

// Return the main index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

// BUILD
// mongoose.connect('mongodb://127.0.0.1:27017/NewWaveDB', { useNewUrlParser: true });
// const db = mongoose.connection;

// Connect to MongoDB using the secret variable
const mySecret = process.env.DB_PASS;
const dbURI = `mongodb+srv://pees:${mySecret}@cluster0.hawsg2s.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(dbURI, { useNewUrlParser: true });
const db = mongoose.connection;

// Handle MongoDB connection events
db.once('open', () => {
  console.log('Connected to the database');
});

db.on('error', err => {
  console.log('Error ' + err);
});

// Start the server and socket.io
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);

// Middleware to pass the `io` object to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Handle socket.io events
io.on('connection', (socket) => {
  console.log('New socket!');

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('seatsUpdated', (seats) => {
    io.emit('seatsUpdated', seats);
  });
});

module.exports = server;