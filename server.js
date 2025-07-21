require('dotenv').config();

// express stuff
const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// security stuff
const argon2 = require('argon2');

// for static stuff
app.use(express.static('app/dist/'))

// file stuff
const fs = require('fs'); 
const { writeFile, readFile } = require('fs');

// express reqs.
app.get('/', (req, res) =>{
  console.log(req)
  return res.sendFile('index.html', { root: './app/dist/' });
})

app.get('/blog', (req, res) => {
  return res.json({"status":"Under construction"})
})

app.get('/verify', async (req, res) => {
  let password = req.query.password;
  if (!password) return res.status(400).redirect('/');
  
  let verified = await argon2.verify(process.env.HASH, password);
  
  if (verified) {
    req.session.authed = true;
  }

  return res.status(verified ? 200: 401).redirect('/');
})

const authentication = (req, res, next) => {
  if (!req.session.authed) {
    return res.status(401).redirect('/');
  }
  
  next();
}

app.get('/admin/panel', authentication, (req, res) => {
  return res.sendFile('index.html', { root: './app/dist/pages/panel/' });
})

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));