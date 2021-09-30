const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

/*app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});*/

app.get("/urls", (req, res) => {
  //verifies the cookie to remain set on multiple pages
  //and to display the user name in every page if logged in
  const userId = req.cookies["user_id"];
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let shortURL = Math.random().toString(36).substring(2,8);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser,};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const userId = req.cookies["user_id"];
  const loggedInUser = users[userId];
  if (longURL === undefined) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: loggedInUser,
    shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Update(CRUD) the long URL
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.quoteContent;
  res.redirect("/urls");
});

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

//Implementing Cookies
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFoundByEmail = findUserByEmail(email, users);
  const userFoundByPassword = findUserByPassword(password, users);

  if (!userFoundByEmail) {
    res.status(403).send("User cannot be found");
  } else if (userFoundByEmail && userFoundByPassword) {
    res.cookie('user_id', userFoundByPassword);
    res.redirect("/urls");
  } else {
    res.status(403).send("User's email is found but the password does not match");
  }
});
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


//Implement User Registration
app.get('/login', (req, res) => {
  const userId = req.cookies["user_id"];
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  res.render('login', templateVars);
});
app.get('/register',(req,res) => {
  const userId = req.cookies["user_id"];
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser};
  res.render('register', templateVars);
});


//Registering new users and checking for Errors
app.post('/register',(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if ((email === "") || (password === "")) {
    res.status(400).send("Email or Password is not entered");
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("User already exists!");
  }
  const userID = createUser(email, password, users);
  res.cookie('user_id', userID);
  res.redirect("/urls");

});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});