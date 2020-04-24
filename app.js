const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const quizzesRoutes = require('./routes/quizzes-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

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

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

app.use((err, req, res, next) => {
  console.log(err);
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
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
