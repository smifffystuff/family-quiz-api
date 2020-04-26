const {addUser, removeUser, getUser, getAllUsers} = require('./users');

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
