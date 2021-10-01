const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.isObject(user, expectedOutput);
  });

  it('should return undefined with non-existent email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined with empty string email', function() {
    const user = getUserByEmail("", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if null is passed to email', function() {
    const user = getUserByEmail(null, testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if " " is passed to email', function() {
    const user = getUserByEmail(" ", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);

  });

});