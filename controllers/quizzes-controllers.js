const uuid = require('uuid');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');
const Quiz = require('../models/quiz');
const User = require('../models/user');
const Question = require('../models/question');

const getAllQuizzes = async (req, res, next) => {
  let quizzes;
  try {
    quizzes = await Quiz.find().populate('questions');
  } catch (err) {
    const error = new HttpError('Something went wrong!');
    return next(error);
  }

  res.json({quizzes: quizzes.map(quiz => quiz.toObject({getters: true}))});
};

const getQuizById = async (req, res, next) => {
  const quizId = req.params.qid;
  let quiz;

  try {
    quiz = await Quiz.findById(quizId).populate('questions');
  } catch (err) {
    const error = new HttpError('Something went wrong!');
    return next(error);
  }

  if (!quiz) {
    const error = new HttpError(
      'Could not find a quiz for the provided id',
      404
    );
    return next(error);
  }

  res.json({quiz: quiz.toObject({getters: true})});
};

const getQuizzesByCreatorId = async (req, res, next) => {
  const userId = req.params.uid;

  // let quizzes;
  let userWithQuizzes;
  try {
    userWithQuizzes = await User.findById(userId).populate({
      path: 'quizzes',
      populate: {
        path: 'questions',
      },
    });
  } catch {
    const error = new HttpError('Something went wrong!', 500);
    return next(error);
  }

  if (!userWithQuizzes || userWithQuizzes.quizzes.length === 0) {
    return next(
      new HttpError('Could not find any quizzes for the provided user id', 404)
    );
  }

  res.json({
    quizzes: userWithQuizzes.quizzes.map(q => q.toObject({getters: true})),
  });
};

const createQuiz = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const {title, description} = req.body;
  const createdQuiz = new Quiz({
    title,
    description,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Invalid creator passed', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdQuiz.save({session: sess});
    user.quizzes.push(createdQuiz);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Creating place failed, pleas try again', 500);
    return next(error);
  }
  res.status(201).json({place: createdQuiz.toObject({getters: true})});
};

const updateQuiz = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const {title, description} = req.body;
  const quizId = req.params.qid;

  let quiz;
  try {
    quiz = await Quiz.findById(quizId);
    quiz.title = title;
    quiz.description = description;
  } catch (err) {
    console.log(err);
    const error = new HttpError('Something went wrong!', 500);
    return next(error);
  }

  if (quiz.creator.toString() !== req.userData.userId) {
    return next(new HttpError('Your are not allowed to edit this quiz', 401));
  }

  try {
    await quiz.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Something went wrong!', 500);
    return next(error);
  }

  res.status(200).json({quiz: quiz.toObject({getters: true})});
};

const deleteQuiz = async (req, res, next) => {
  const quizId = req.params.qid;
  let quiz;
  try {
    quiz = await Quiz.findById(quizId).populate('creator');
  } catch (err) {
    console.log(err);
    const error = new HttpError('Something went wrong!!', 500);
    return next(error);
  }

  if (!quiz) {
    return next(new HttpError('Could not find a quiz with this id', 404));
  }

  if (quiz.creator.id !== req.userData.userId) {
    return next(new HttpError('Your are not allowed to delete this quiz', 40));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await quiz.remove({session: sess});
    quiz.creator.quizzes.pull(quiz);
    await quiz.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Something went wrong!', 500);
    return next(error);
  }
  res.status(200).json({message: 'Successfully deleted'});
};

const updateQuestions = async (req, res, next) => {
  console.log('Updating questions');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const quizId = req.params.qid;
  console.log(quizId);
  let quiz;

  try {
    quiz = await Quiz.findById(quizId);
  } catch (err) {
    const error = new HttpError('Something went wrong!');
    return next(error);
  }

  if (!quiz) {
    const error = new HttpError(
      'Could not find a quiz for the provided id',
      404
    );
    return next(error);
  }

  const curQuestionCount = quiz.question_count;
  console.log(curQuestionCount);
  let questionNumber = 0;

  try {
    quiz.questions = [];
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Question.deleteMany({quiz: quizId}, {session: sess});
    for (const q of req.body.questions) {
      console.log(q.question);
      const newQuestion = new Question({
        number: ++questionNumber,
        question: q.question,
        quiz: quizId,
      });
      await newQuestion.save({session: sess});
      quiz.questions.push(newQuestion);
      quiz.question_count = questionNumber;
    }
    await quiz.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Creating question failed, please try again',
      500
    );
    return next(error);
  }
  res.status(201).json({quiz: quiz.toObject({getters: true})});

  // if (quiz.creator.toString() !== req.userData.userId) {
  //   return next(new HttpError('Your are not allowed to edit this quiz', 401));
  // }

  // try {
  //   await quiz.save();
  // } catch (err) {
  //   console.log(err);
  //   const error = new HttpError('Something went wrong!', 500);
  //   return next(error);
  // }
  // console.log(req.body.question);
  // res.json({message: 'Adding question'});
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  getQuizzesByCreatorId,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  updateQuestions,
};
