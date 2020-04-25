const Answer = require('../models/answer');

const getAllAnswers = (req, res, next) => {
  res.json({message: 'getAllAnswers'});
};

const getAnswersByQuizId = async (req, res, next) => {
  const quizId = req.params.qid;
  console.log(quizId);
  const answers = await Answer.find({
    quiz: quizId,
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
  res.json({message: 'Answer submitted'});
};

const getAllAnswersByQuizId = (req, res, next) => {
  res.json({message: 'getAllAnswersByQuizId'});
};

module.exports = {
  getAllAnswers,
  getAllAnswersByQuizId,
  getAnswersByQuizId,
  getAnswersForUser,
  submitAnswer,
};
