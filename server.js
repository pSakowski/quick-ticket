const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoose = require('mongoose');
const socket = require('socket.io');
require('dotenv').config();
const concertsRouter = require('./routes/concerts.routes');
const seatsRoutes = require('./routes/seats.routes');
const testimonialsRouter = require('./routes/testimonials.routes');

const app = express();
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to the database');
});

db.on('error', (err) => {
  console.log('Error ' + err);
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

app.use(express.static(path.join(__dirname, '/client/build')));

app.use('/api/', concertsRouter);
app.use('/api/', seatsRoutes);
app.use('/api/', testimonialsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

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
