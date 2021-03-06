const cookieSession = require('cookie-session');
const express = require("express");
const { urlsForUser, createUser, getUserByEmail, idMatched, generateRandomId } = require('./helpers');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["cookie session to encrypt the values"],
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  i3DoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ42lW"
  }
};

const password = "purple";
const hashedPassword = bcrypt.hashSync(password, 10);

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: hashedPassword,
  }
};

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  //verifies the cookie to remain set on multiple pages
  //and to display the user name in every page if logged in
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const shortUrlFound = urlsForUser(userId, urlDatabase);
  const templateVars = {
    user: loggedInUser,
    filteredUrls: shortUrlFound,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomId();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser,
  };
  if (loggedInUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];

  if (!urlDatabase[req.params.shortURL]) {
    res.send("Id does not exist in user database!!");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = {
    user: loggedInUser,
    shortURL: req.params.shortURL,
    longURL: longURL,
  };
  if (urlDatabase[req.params.shortURL].userID !== users[userId].id) {
    res.send("Sorry, you dont have permission to edit other user's url");
    return;
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser,
  };
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.render('error.ejs', templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  let idMatchedVar = 0;
  idMatchedVar = idMatched(shortURL, users, urlDatabase);
  if (!idMatchedVar) {
    res.send("Sorry, you dont have permission to delete other user's url");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  let idMatchedVar = 0;
  idMatchedVar = idMatched(shortURL, users, urlDatabase);
  if (!idMatchedVar) {
    res.send("Sorry, you dont have permission to delete other user's url");
    return;
  }
});

//Update(CRUD) the long URL
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.quoteContent;
  res.redirect("/urls");
});

//Implementing Cookies
app.post("/login", (req,res) => {
  const { email, password } = req.body;
  const userFoundByEmail = getUserByEmail(email, users);
  if (!userFoundByEmail) {
    res.status(403).send("User cannot be found");
  } else {
    if (bcrypt.compareSync(password, userFoundByEmail.password)) {
      req.session.user_id = userFoundByEmail.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("User's email is found but the password does not match");
    }
  }
});

//This request helps user to log out if logged in
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});


//Implement User Registration and Login
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  if (loggedInUser) {
    res.redirect("/urls");
  } else {
    res.render('login', templateVars);
  }
});

app.get('/register',(req,res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  if (loggedInUser) {
    res.redirect("/urls");
  } else {
    res.render('register', templateVars);
  }
  
});

//Registering new users and checking for Errors
app.post('/register',(req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if ((email === "") || (password === "")) {
    res.status(400).send("Email or Password is not entered");
  }

  const userFound = getUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("User already exists!");
  }

  const userID = createUser(email, hashedPassword, users);
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});