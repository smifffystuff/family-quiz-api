const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  meetingId: {
    type: String,
  },
  question_count: {
    type: Number,
    default: 0,
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Question',
    },
  ],
});

module.exports = mongoose.model('Quiz', quizSchema);
