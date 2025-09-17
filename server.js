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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

// to do - store cache of html, dynamically update when new blog post?
app.get('/blog', async (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'app/dist/pages/blog/index.html');
    let html = await fs.readFile(templatePath, 'utf8');

    let blogsHtml = "";
    const blogIDs = Object.keys(blogs).reverse(); 

    for (let blogID in blogIDs) {
      blogID = blogIDs[blogID]

      const blog = blogs[blogID]
      blogsHtml += `
        <div id="${blogID}" class="blogSelection">
          <a href="/blog/${blogID}" style="cursor:pointer">${blog.title}</a>
          <hr>
          <p>${blog.headline}</p>
        </div>
      `;
    }

    html = html.replace("{{blogs}}", blogsHtml);

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error when rendering blog :(");
  }
});


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

app.get('/api/blogs', authentication, (req, res) => {
  res.json(blogs)
})

app.post('/api/blog/post', authentication, async (req, res) => {
  const blogInfo = req.body;
  const {title, key, headline, content} = blogInfo;
  if (!title || !headline || !key || !content) return res.status(400).json( { error:"malformed content :(" } )
  
  try { 
    // ig theorically that means you can also update the blog like this cuz it overwrites the blog entry
    // make it client side?
    // openEditor() or smth similar to overwrite manaco's content with the content of an existing blog entry
    blogs[ key ] = blogInfo;
    generateImage(key);
    saveBlogs();
    
    res.send({
      message: blogInfo,
    });

  } catch (error) {
    console.warn(error);
    res.status(500).json( { "error":"whoops! internal server error!" } )
  }
})

const filePath = 'blogs.json';
let blogs;

async function initBlogJson() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    blogs = JSON.parse(data);

    return blogs;
  } catch (err) {
    console.error("Error reading blogs:", err);
    return {};
  }
}

async function saveBlogs() {
  try {
    const json = JSON.stringify(blogs);
    const tempFilePath = `${filePath}.tmp_${Date.now()}`;
    
    await fs.writeFile(tempFilePath, data, 'utf8');
    await fs.rename(tempFilePath, filePath);
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

async function generateImage(key){
  const templatePath = path.join(__dirname, 'app/dist/pages/blog/templateImage.html');

  console.log(blogs)
  let blog = blogs[key]
  console.log(blog)

  let template = await fs.readFile(templatePath, 'utf8');

  template = template
    .replaceAll('{{image}}', key)
    .replaceAll('{{title}}', blog.title)
    .replaceAll('{{headline}}', blog.headline)
    .replaceAll('{{content}}', blog.content);

  const markup = html(template);

  const fontData = await fs.readFile(
    "VictorMono-Regular.ttf"
  );
  
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
    background: "rgba(255, 255, 255, 1)",
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFile("./generated/blogs" + key + ".png", pngBuffer)
}

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));