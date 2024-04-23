document.onload = addListnerToNavBtns()

function addListnerToNavBtns(){
  let navbar = document.getElementById('nav');
  
  for (const child of navbar.children) {
    if (child.nodeName !== 'BUTTON') continue;

    child.addEventListener('mousedown', (e) => { changeScene( pages[child.id], child.id ) } ) 
  }
}

var lastSelectedElement = document.getElementById('aboutMe')

function changeScene(newWindowHtml, id){
  let window = document.getElementById('window')
  window.innerHTML = newWindowHtml;
  
  const currentElement = document.getElementById(id)

  lastSelectedElement.classList.remove('selected');
  currentElement.classList.add('selected');
  
  lastSelectedElement = currentElement
}

const pages = {
  aboutMe: 
  `
  <br>
  <div style="text-align: center; color: antiquewhite; max-width: 50vw; min-width: 50vw; margin-left: 5%;" class="card">
    <h2> About me </h2>
    <hr style="width: 90%;">
    <p style="font-size: larger;">
      Hi, i'm ExonAuto. 
      <br>
      I like programing, cats, editing videos, and animating. (well, i try lol)
      <br>
      <br>
      My current goal is to get top 3 on the polyjam for the coding/games catagory, as well as to start actually uploading content to my <a href="https://www.youtube.com/@exonauto">youtube channel</a>.
    </p>
  </div>
  `,
  socials: 
  `
  <br>
  <div style="text-align: center; color: antiquewhite; max-width: 50vw; min-width: 50vw; margin-left: 5%;" class="card">
  <h2> Socials </h2>
  <hr style="width: 90%;">
    <p style="font-size: larger;">
    My accounts
    <br>
    <div>
      <p>I have a <a href="https://youtube.com/@exonauto"> youtube account </a>,</p>
      <p>My github profile is <a href="https://github.com/777Portal">777Portal</a>,</p>
      <p>My discord is @ExonAuto,</p>
      <p>and my Minecraft username is ExonAuto.</p>
    </div>
    <br>
    </p>
  </div>
  `, 
  skills: 
  `
  <br>
  <div style="text-align: center; color: antiquewhite; max-width: 50vw; min-width: 50vw; margin-left: 5%;" class="card" id="window">
  <h2> Skills </h2>
  <hr style="width: 90%;">
    <p style="font-size: larger;">
    My skills
    <br>
    For coding skills, i have
    <div>
      <p> vanilla js </p>
      <p> node.js </p>
      <p> html </p>
      <p> css </p>
    </div>
    <br>
    I also like animating using <a href="https://www.mineimator.com/">mineimator</a>, and editing vidoes using DaVinci resolve
  </p>
  </div>
  `
}
