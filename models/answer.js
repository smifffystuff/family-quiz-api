const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
  number: {
    type: Number,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  quiz: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Quiz',
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

module.exports = mongoose.model('Answer', answerSchema);
