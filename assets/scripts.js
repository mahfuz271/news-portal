const category = document.getElementById('category');
const posts_div = document.getElementById('posts');
const loader = `<div class="text-center col-12"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>`;
posts_div.innerHTML = loader;
category.innerHTML = loader;

let CallAPI = (url, success) => {
    fetch(url)
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
            if (success) success(data);
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
}

CallAPI("https://openapi.programming-hero.com/api/news/categories", function (res) {
    let html = "";

    if (res.status) {
        res.data.news_category.forEach((item) => {
            html += `<li class="nav-item"><a class="nav-link link-dark" data-id="${item.category_id}" href="#">${item.category_name}</a></li>`;
        });
    }

    category.innerHTML = html;

    //add click event
    category.querySelectorAll("li a").forEach((el) => {
        el.addEventListener('click', (event) => {
            //remove active class from all elemnt
            category.querySelectorAll("li a").forEach((el) => {
                el.classList.remove("active");
            });
            //add active class on current item
            event.target.classList.add("active");
        })
    });
});





