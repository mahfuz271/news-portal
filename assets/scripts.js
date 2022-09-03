const category = document.getElementById('category');
const posts_div = document.getElementById('posts');
const total_div = document.getElementById('total');
const loader = `<div class="text-center col-12"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>`;
posts_div.innerHTML = loader;
category.innerHTML = loader;
total_div.innerHTML = loader;

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

//add click event on main menu
document.querySelectorAll(".main_menu li a").forEach((el) => {
    el.addEventListener('click', (event) => {
        //remove active class from all elemnt
        document.querySelectorAll(".main_menu li a").forEach((el) => {
            el.classList.remove("active");
        });
        //add active class on current item
        event.target.classList.add("active");
        document.querySelectorAll(event.target.getAttribute("data-hide")).forEach((el) => {
            el.style.display = "none";
        });
        document.querySelectorAll(event.target.getAttribute("data-show")).forEach((el) => {
            el.style.display = "block";
        });
        
    })
});

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
            loadNews(event.target.getAttribute("data-id"), event.target.innerText);
        })
    });

    category.querySelector("li:first-child a").click();
});

function get_valid(str) {
    if (str == null || str == '') {
        str = '&nbsp;';
    }
    return str;
}

function loadNews(id, category_name) {
    posts_div.innerHTML = loader;
    total_div.innerHTML = loader;
    CallAPI("https://openapi.programming-hero.com/api/news/category/" + id, function (res) {
        let html = "";
        let total = 0;
        if (res.status) {
            total = res.data.length;
            res.data.forEach((item) => {
                html += `<div class="card mb-4">
                <div class="row g-0">
                    <div class="col-lg-2">
                        <img src="${item.thumbnail_url}" class="img-fluid rounded-start h-100 w-100" alt="${item.title}">
                    </div>
                    <div class="col-lg-10">
                        <div class="card-body">
                            <h5 class="card-title h2">${get_valid(item.title)}</h5>
                            <p class="card-text">${get_valid(item.details.substr(0, 500))}...
                            </p>
                            <div
                                class="position-relative row row-cols-4 align-items-center justify-content-center text-center">
                                <div class="text-start">
                                    <img src="${item.author.img}"
                                        class="author-img img-fluid position-absolute" alt="">
                                    <span class="d-inline-block ms-5 ps-1 lh-1">
                                        <h3 class="fs-6 fw-bolder">${get_valid(item.author.name)}</h3>
                                        <p class="fs-6 m-0">${get_valid(item.author.published_date).split(" ")[0]}
                                        </p>
                                    </span>
                                </div>
                                <span><i class="fa fa-eye"></i> ${item.total_view}</span>
                                <div class="position-relative">
                                    <div class="rating-box">
                                        <div class="rating" style="width:${item.rating.number * 10}%;"></div>
                                    </div>
                                </div>
                                <span><a href="#" class="btn btn-default fs-4 float-end"><i
                                            class="fa-solid fa-arrow-right"></i>
                                    </a></span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>`;

            });
        }
        if (html == '') {
            html = '<p class="text-center">No news published.</p>';
        }
        total_div.innerHTML = `${total} items found for category ${category_name}`;
        posts_div.innerHTML = html;
    });

}





