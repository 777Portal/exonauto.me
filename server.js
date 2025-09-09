import "dotenv/config.js";

import path from 'path';

import {fileURLToPath} from 'url';

import satori from "satori";
import { html } from "satori-html";

import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// express stuff
import express from 'express';
import session from 'express-session';

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// security stuff
import argon2 from 'argon2';

// for static stuff
app.use(express.static('app/dist/'))
app.use(express.static('generated/'))

// file stuff
import { promises as fs } from 'fs';

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
      .replaceAll('{{image}}', req.params.id)
      .replaceAll('{{title}}', blog.title)
      .replaceAll('{{headline}}', blog.headline)
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

  return res.status(verified ? 200: 401).redirect('/admin/panel');
})

app.get('/admin/panel', authentication, (req, res
  ) => {
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
    
    for (let blog in blogs) {
      generateImage(blog); // placeholder - will generate only once, once i set up the api for creating blogs from the dashboard.
    }

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

async function generateImage(uuid){
  const templatePath = path.join(__dirname, 'app/dist/pages/blog/templateImage.html');

  console.log(blogs)
  let blog = blogs[uuid]

  let template = await fs.readFile(templatePath, 'utf8');

  template = template
    .replaceAll('{{image}}', uuid)
    .replaceAll('{{title}}', blog.title)
    .replaceAll('{{headline}}', blog.headline)
    .replaceAll('{{content}}', blog.content);

  const markup = html(template);

  const fontData = await fs.readFile(
    "/System/Library/Fonts/Supplemental/Arial.ttf"
  );
  
  // See https://github.com/vercel/satori#documentation
  const svg = await satori(markup, {
    width: 1200,
    height: 628,
    fonts: [
      {
        name: "Arial",
        data: fontData,
        weight: "auto",
        style: "normal",
      },
    ],

  });

  
  const resvg = new Resvg(svg, {
    background: "rgba(255, 255, 255, 1)", // optional
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFile("./generated/blogs" + uuid + ".png", pngBuffer)
}

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));