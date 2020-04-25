const express = require('express');
const {check} = require('express-validator');

const checkAuth = require('../middleware/check-auth');

const {
  getAllAnswers,
  getAllAnswersByQuizId,
  getAnswersByQuizId,
  submitAnswer,
  markAnswer,
} = require('../controllers/answers-controller');

const router = express.Router();

router.use(checkAuth);

router.get('/', getAllAnswers);

router.get('/:qid', getAnswersByQuizId);

router.get('/all/:qid', getAllAnswersByQuizId);

router.post(
  '/:qid/:qnum',
  [check('answer').not().isEmpty(), check('question').not().isEmpty()],
  submitAnswer
);

router.patch('/:aid', markAnswer);

module.exports = router;
