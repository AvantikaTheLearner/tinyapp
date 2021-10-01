const bcrypt = require('bcryptjs');

const urlsForUser = function(id, urlData) {
  const filteredUrls = {};
  const keys  = Object.keys(urlData);
  for (const key of keys) {
    
    if (urlData[key]['userID'] === id) {
      filteredUrls[key] = urlData[key];
    }
  }
  return filteredUrls;
};

const createUser = function(email, hashedPassword, users) {
  const userID = Math.random().toString(36).substring(2,8);
  
  users[userID] = {
    id: userID,
    email,
    password: hashedPassword,
  };
  return userID;
};

const findUserByEmail = function(email, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};


module.exports = { urlsForUser, createUser, findUserByEmail };