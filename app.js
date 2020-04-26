const fs = require('fs');
const path = require('path');
const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socketIO = require('socket.io');

const quizzesRoutes = require('./routes/quizzes-routes');
const usersRoutes = require('./routes/users-routes');
const answersRoutes = require('./routes/answers-routes');
const HttpError = require('./models/http-error');

const {socketConnection} = require('./socket_actions');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', socketConnection);

app.use(bodyParser.json());

// app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/quizzes', quizzesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/answers', answersRoutes);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(err.code || 500);
  res.json({message: err.message || 'An unknown error occurred'});
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-mfppd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(() => {
    const port = process.env.PORT || 5000;
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
