const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//function content to generate random string of 6 characters
const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allNumbers = [..."0123456789"];

const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha];

const generateRandomString = (base, len) => {
  return [...Array(len)]
    .map(i => base[Math.random() * base.length | 0])
    .join('');
};

//let shortURL = generateRandomString(base, 6);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});*/

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(base, 6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL };
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

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});