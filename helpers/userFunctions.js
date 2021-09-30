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

const createUser = function(email, password, users) {
  const userID = Math.random().toString(36).substring(2,8);
  
  users[userID] = {
    id: userID,
    email,
    password,
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

const findUserByPassword = function(password, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.password === password) {
      return user.id;
    }
  }
  return false;
};

module.exports = { urlsForUser, createUser, findUserByEmail, findUserByPassword };