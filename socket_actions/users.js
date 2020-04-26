const User = require('../models/user');

let users = [];

const addUser = async ({id, userId}) => {
  const userRecord = await User.findById(userId);
  const existingUserIndex = users.findIndex(user => user.userId === userId);
  const user = {id, userId, name: userRecord ? userRecord.name : userId};
  if (existingUserIndex === -1) {
    users.push(user);
  } else {
    users[existingUserIndex] = user;
  }

  return user;
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    console.log(users);
    users.splice(index, 1)[0];
    console.log(users);
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getAllUsers = () => {
  return users;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getAllUsers,
};
