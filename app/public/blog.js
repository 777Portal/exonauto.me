async function fetchBlogs(){
    const response = await fetch('/api/blogs');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blogs = await response.json();
    return blogs;
}

async function listBlogs(){
    let blogs = await fetchBlogs();
    let holder = document.getElementById('blogMain');

    holder.innerHTML = "";
    
    for (let blogUUID in blogs) {
        let blog = blogs[blogUUID];
        console.log(blog);

        let blogHolder = createElm('div');
        blogHolder.id = blogUUID;
        blogHolder.classList = "blogSelection"

        const h1 = document.createElement("a");
        h1.textContent = blog.title;
        h1.style.cursor = "pointer";
        
        h1.addEventListener("click", () => {
            window.location.href = "./blog/" + blogUUID;
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