// express stuff
const express = require('express');
const session = require('express-session');

const app = express();

// for static stuff
app.use('/assets', express.static('assets'))

// file stuff
const fs = require('fs'); 
const { writeFile, readFile } = require('fs');

// express reqs.
app.get('/', (req, res) =>{
  console.log(req)
  return res.sendFile('landingPage.html', { root: './views' });
})

const port = 3003
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));