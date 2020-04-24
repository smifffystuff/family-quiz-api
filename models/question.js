const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  number: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  quiz: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Quiz',
  },
});

module.exports = mongoose.model('Question', questionSchema);
