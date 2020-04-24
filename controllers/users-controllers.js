const fs = require('fs');
const path = require('path');

const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const uploadFile = async fileName => {
  console.log(
    '================================= UPLOADING ==============================='
  );
  console.log(fileName);
  console.log(process.env.AWS_BUCKET);
  const fileContents = fs.readFileSync(fileName);
  const parsedPath = path.parse(fileName);
  console.log(`${process.env.IMAGES_FOLDER}${parsedPath.base}`);

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${process.env.IMAGES_FOLDER}${parsedPath.base}`,
    Body: fileContents,
    ACL: 'public-read',
  };

  const putObjectResult = await s3.putObject(params).promise();

  fs.unlink(fileName, err => {
    console.log(err);
  });

  return `${process.env.IMAGES_FOLDER}${parsedPath.base}`;
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Get failed, please try again later', 500);
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const {name, email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('Email already exists', 422);
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again later',
      500
    );
    return next(error);
  }

  const imageLoc = await uploadFile(req.file.path);

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: imageLoc,
    quizzes: [],
  });

  console.log(createdUser);

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: '6h',
      }
    );
  } catch (err) {
    const error = new HttpError('Creating user failed, pleas try again', 500);
    return next(error);
  }

  res
    .status(201)
    .json({userId: createdUser.id, email: createdUser.email, token});
};

const login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const {email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Creating user failed, pleas try again', 500);
    return next(error);
  }

  if (!existingUser) {
    return next(new HttpError('Invalid credentials, could not log in.', 403));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError('Could not log in, please try again', 500));
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid credentials, could not log in.', 403));
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: '6h',
      }
    );
  } catch (err) {
    const error = new HttpError('Could not log you in, please try again', 500);
    return next(error);
  }

  res.status(201).json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
