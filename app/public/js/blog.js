async function fetchBlogs(){
    const response = await fetch('/api/blogs');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blogs = await response.json();
    return blogs;
}

async function listBlogs(){
    let blogs = await fetchBlogs();
    let holder = document.getElementById('blogs');

    holder.innerHTML = "";
    
    for (let blogKey in blogs) {
        let blog = blogs[blogKey];
        console.log(blog);

        let blogHolder = createElm('div');
        blogHolder.id = blogKey;
        blogHolder.classList = "blogSelection"

        const h1 = document.createElement("a");
        h1.textContent = blog.title;
        h1.style.cursor = "pointer";
        
        h1.addEventListener("click", () => {
            editBlog(blog, blogKey);
        });

        blogHolder.appendChild(h1);
        
        let hr = createElm('hr');
        blogHolder.appendChild(hr);
        
        let p = createElm('p', blog.headline);
        blogHolder.appendChild(p);

        holder.prepend(blogHolder);
    }

}

function createElm(tag, text){
    return (() => { const el = document.createElement(tag); if (text) el.innerText = text; return el; })();
}

listBlogs();