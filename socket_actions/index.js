const Answer = require('../models/answer');

const {
  addUser,
  removeUser,
  getUser,
  getAllUsers,
  getUserByUserId,
} = require('./users');

const socketConnection = socket => {
  console.log('We have a new connection');

  socket.on('join', async (userId, cb) => {
    const user = await addUser({
      id: socket.id,
      userId,
    });
    console.log(user);
    console.log(`${user.userId} name`);
    socket.emit('message', {
      user: 'admin',
      text: `Welcome to the quiz ${user.name}`,
    });
    socket.broadcast.to('quiz').emit('message', {
      user: 'admin',
      text: `${user.name} Joined the Quiz`,
    });
    socket.join('quiz');
  });

  socket.on('message', (msg, cb) => {
    console.log('Got a test message: ' + msg);
    const user = getUser(socket.id);
    socket.emit('message', {
      user: user ? user.name : 'unknown',
      text: msg,
    });
    socket.broadcast.to('quiz').emit('message', {
      user: user ? user.name : 'unknown',
      text: msg,
    });
  });
  socket.on('answer', answer => {
    console.log(answer);
    const user = getUser(socket.id);
    console.log(
      `${user.name} answered question ${answer.number}\n${answer.answer}`
    );
    socket.broadcast.to('quiz').emit('answer_submitted', answer);
  });

  socket.on('answer-marked', ({answer}) => {
    const user = getUserByUserId(userId);
    socket.broadcast.to('quiz').emit('message', {
      user: 'admin',
      text: `${user ? user.name : 'unknown'} got question ${questNum} ${
        result === 'YES' ? 'Correct' : 'Wrong'
      }`,
    });
    // console.log(questNum, result, userId);
    // socket.send();
  });

  socket.on('leave', () => {
    const user = getUser(socket.id);
    removeUser(socket.id);
    socket.broadcast.to('quiz').emit('message', {
      user: 'admin',
      text: `${user ? user.name : 'unknown'} has left the quiz`,
    });
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    socket.broadcast.to('quiz').emit('message', {
      user: 'admin',
      text: `${user ? user.name : 'unknown'} has left the quiz`,
    });
  });
};

module.exports = {
  socketConnection,
};
