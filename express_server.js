const cookieSession = require('cookie-session');
const express = require("express");
const { urlsForUser, createUser, findUserByEmail } = require('./helpers/userFunctions');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//const cookieParser = require("cookie-parser");
//app.use(cookieParser());
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
  console.log(urlDatabase);
  let shortURL = Math.random().toString(36).substring(2,8);
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
    user: loggedInUser,};
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
    shortURL: req.params.shortURL, longURL: longURL };
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
  const ID = Object.keys(users);
  if (urlDatabase[shortURL].userID !== ID[0]) {
    res.send("Sorry, you dont have permission to delete other user's url");
    return;
  }
  
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Update(CRUD) the long URL
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.quoteContent;
  res.redirect("/urls");

});

//Implementing Cookies
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFoundByEmail = findUserByEmail(email, users);

  if (!userFoundByEmail) {
    res.status(403).send("User cannot be found");
  } else {
    if (bcrypt.compareSync(password, userFoundByEmail.password)) {
      //res.cookie('user_id', userFoundByEmail.id);
      req.session.user_id = userFoundByEmail.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("User's email is found but the password does not match");
    }
  }

});
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


//Implement User Registration
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  res.render('login', templateVars);
});
app.get('/register',(req,res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  res.render('register', templateVars);
});


//Registering new users and checking for Errors
app.post('/register',(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if ((email === "") || (hashedPassword === "")) {
    res.status(400).send("Email or Password is not entered");
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("User already exists!");
  }
  const userID = createUser(email, hashedPassword, users);
  //res.cookie('user_id', userID);
  req.session.user_id = userID;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});