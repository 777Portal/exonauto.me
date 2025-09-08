require('dotenv').config();

const path = require("path");

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
const fs = require('fs').promises

const authentication = (req, res, next) => {
  if (!req.session.authed) {
    return res.status(401).redirect('/');
  }
  
  next();
}

app.get('/', (req, res) =>{
  console.log(req)
  return res.sendFile('index.html', { root: './app/dist/' });
})

app.get('/blog', (req, res) => {
  return res.sendFile('index.html', { root: './app/dist/pages/blog' });
})

app.get('/blog/:id', async (req, res) => {
  const blog = blogs[req.params.id];
  if (!blog) return res.status(404).send('Not found... Whoops?');

  try {
    const templatePath = path.join(__dirname, 'app/dist/pages/blog/template.html');
    let template = await fs.readFile(templatePath, 'utf8');

    template = template
      .replaceAll('{{title}}', blog.title)
      .replaceAll('{{headline}}', blog.title)
      .replaceAll('{{content}}', blog.content);

    res.send(template);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/verify', async (req, res) => {
  let password = req.query.password;
  if (!password) return res.status(400).redirect('/');
  
  let verified = await argon2.verify(process.env.HASH, password);
  
  if (verified) {
    req.session.authed = true;
  }

  return res.status(verified ? 200: 401).redirect('/');
})

app.get('/admin/panel', authentication, (req, res) => {
  return res.sendFile('index.html', { root: './app/dist/pages/panel/' });
})

app.get('/api/blogs', (req, res) => {
  res.json(blogs)
})

const filePath = 'blogs.json';

let blogs;

async function initBlogJson() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    blogs = JSON.parse(data);
    console.log(blogs)
    return blogs;
  } catch (err) {
    console.error("Error reading blogs:", err);
    return {};
  }
}

async function saveBlogs() {
  try {
    const json = JSON.stringify(users);
    await fs.writeFile(filePath, json, 'utf8');
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));