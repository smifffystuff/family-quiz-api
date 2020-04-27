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
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  number_questions: {
    type: Number,
    required: true,
    default: 10,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
