const express = require('express');
const {check} = require('express-validator');

const checkAuth = require('../middleware/check-auth');

const {
  getQuizzesByCreatorId,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizzes-controllers');

const router = express.Router();

router.get('/:qid', getQuizById);

router.get('/user/:uid', getQuizzesByCreatorId);

router.use(checkAuth);

router.post(
  '/',
  [check('title').not().isEmpty(), check('description').isLength({min: 5})],
  createQuiz
);

router.patch(
  '/:qid',
  [check('title').not().isEmpty(), check('description').isLength({min: 5})],
  updateQuiz
);

router.delete('/:qid', deleteQuiz);

module.exports = router;
