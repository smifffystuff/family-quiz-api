const Answer = require('../models/answer');

const getAllAnswers = (req, res, next) => {
  res.json({message: 'getAllAnswers'});
};

const getAnswersByQuizId = async (req, res, next) => {
  const quizId = req.params.qid;
  const userId = req.userData.userId;

  console.log(quizId);
  const answers = await Answer.find({
    quiz: quizId,
    creator: userId,
  }).populate('creator');
  res.json(answers.map(answer => answer.toObject({getters: true})));
};

const getAnswersForUser = (req, res, next) => {
  res.json({message: 'getAnswersForUsers'});
};

const submitAnswer = (req, res, next) => {
  const quizId = req.params.qid;
  const answerNumber = req.params.qnum;

  const newAnswer = new Answer({
    number: answerNumber,
    answer: req.body.answer,
    quiz: quizId,
    creator: req.userData.userId,
  });
  newAnswer.save();
  res.json(newAnswer.toObject({getters: true}));
};

const getAllAnswersByQuizId = async (req, res, next) => {
  const quizId = req.params.qid;

  console.log(quizId);
  const answers = await Answer.find({
    quiz: quizId,
  }).populate('creator');
  res.json(answers.map(answer => answer.toObject({getters: true})));
};

const markAnswer = async (req, res, next) => {
  console.log('Mark answer');
  const answerId = req.params.aid;
  const correct = req.body.correct;
  console.log('Mark answer', answerId, correct);

  const answerToUpdate = await Answer.findById(answerId);
  answerToUpdate.correct = correct;
  await answerToUpdate.save();
  res.json({message: 'Mark Answer Success'});
};

module.exports = {
  getAllAnswers,
  getAllAnswersByQuizId,
  getAnswersByQuizId,
  getAnswersForUser,
  submitAnswer,
  markAnswer,
};
