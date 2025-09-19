import "dotenv/config.js";

import path from 'path';
import {fileURLToPath} from 'url';
import { promises as fs } from 'fs';

import express from 'express';
import session from 'express-session';

import argon2 from 'argon2';

import { authentication, blogs, initBlogJson } from "./utils/utils.js";
import api from "./api/api.js";
import blog from "./blog/blog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('../app/dist/'))
app.use(express.static('../generated/'))

app.use('/api', api)
app.use('/blog', blog)

app.get('/', (req, res) =>{
  console.log(req)
  return res.sendFile('index.html', { root: '../app/dist/' });
})

app.get('/admin', authentication, (req, res
  ) => {
  return res.sendFile('index.html', { root: '../app/dist/pages/panel/' });
})

app.get('/pulse', (req, res
  ) => {
  return res.sendFile('index.html', { root: '../app/dist/pages/echo/' });
})

app.get('/verify', async (req, res) => {
  let password = req.query.password;
  if (!password) return res.status(400).redirect('/');
  
  let verified = await argon2.verify(process.env.HASH, password);
  
  if (verified) {
    req.session.authed = true;
  }

  return res.status(verified ? 200: 401).redirect('/admin');
})

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));