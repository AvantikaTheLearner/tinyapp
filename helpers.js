//This function gives filtered lists of URLs for a specific user
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

//This function create and stores user's credentials for a new user
const createUser = function(email, hashedPassword, users) {
  const userID = Math.random().toString(36).substring(2,8);
  
  users[userID] = {
    id: userID,
    email,
    password: hashedPassword,
  };
  return userID;
};

//This function fetches user by comparing email id from database and provided in browser
const getUserByEmail = function(email, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};


module.exports = { urlsForUser, createUser, getUserByEmail };