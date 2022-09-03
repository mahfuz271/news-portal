const category = document.getElementById('category');
const posts_div = document.getElementById('posts');
const total_div = document.getElementById('total');
const sort_by = document.getElementById('sort_by');
const filter = document.getElementById('filter');
const modalEl = document.getElementById('newsmodal');
const modal = new bootstrap.Modal(modalEl);

let news = [];
const loader = `<div class="text-center col-12"><div class="spinner-border" role="status"></div></div>`;

posts_div.innerHTML = loader;
category.innerHTML = loader;
total_div.innerHTML = loader;

// arrow function to get api data
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

//common functions
function sort_by_highest(a, b) {
    if (a.total_view > b.total_view) {
        return -1;
    }
    if (a.total_view < b.total_view) {
        return 1;
    }
    return 0;
}

function sort_by_lowest(a, b) {
    if (a.total_view < b.total_view) {
        return -1;
    }
    if (a.total_view > b.total_view) {
        return 1;
    }
    return 0;
}


function get_valid(str) {
    if (str == null || str == '') {
        str = 'NoData';
    }
    return str;
}

function loadNews(id, category_name) {
    posts_div.innerHTML = loader;
    total_div.innerHTML = loader;
    CallAPI("https://openapi.programming-hero.com/api/news/category/" + id, function (res) {
        if (res.status) {
            news = res.data;
        } else {
            news = [];
        }
        newsHtml(news);
        let total = news.length;
        if (total < 1) {
            filter.style.display = 'none';
            total_div.innerHTML = '<p class="m-0">No news published.</p>';
        } else {
            filter.style.display = 'block';
            total_div.innerHTML = `${total} items found for category ${category_name}`;
        }
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

//sort by event
sort_by.addEventListener('change', (event) => {
    let articles = news.slice();
    switch (event.target.value) {
        case '2':
            articles.sort(sort_by_lowest);
            break;
        case '3':
            articles.sort(sort_by_highest);
            break;
        default:
    }
    newsHtml(articles);
});

//load categories
CallAPI("https://openapi.programming-hero.com/api/news/categories", function (res) {
    let html = "";

    if (res.status) {
        res.data.news_category.forEach((item) => {
            html += `<li class="nav-item"><a class="nav-link link-dark" data-id="${item.category_id}" href="#">${item.category_name}</a></li>`;
        });
    }

    category.innerHTML = html;

    //add click event on categories
    category.querySelectorAll("li a").forEach((el) => {
        el.addEventListener('click', (event) => {
            //remove active class from all elemnt
            category.querySelectorAll("li a").forEach((el) => {
                el.classList.remove("active");
            });
            //add active class on current item
            event.target.classList.add("active");
            sort_by.value = '1';
            document.querySelector(".main_menu li:first-child a").click();
            loadNews(event.target.getAttribute("data-id"), event.target.innerText);
        })
    });

    category.querySelector("li:first-child a").click();
});

//news element loop
let newsHtml = (news_el) => {
    posts_div.innerHTML = loader;
    let html = "";
    news_el.forEach((item) => {
        html += `<div class="card mb-4 article">
        <div class="row g-0">
            <div class="col-lg-2">
                <img src="${item.thumbnail_url}" class="img-fluid rounded-start h-100 w-100" alt="${item.title}">
            </div>
            <div class="col-lg-10">
                <div class="card-body ps-3">
                    <a href="#" class="text-decoration-none text-dark" data-id="${item._id}"><h5 class="card-title h2">${get_valid(item.title)}</h5></a>
                    <p class="card-text">${((item.details.length > 500) ? item.details.substr(0, 500) : item.details)}...
                    </p>
                    <div class="position-relative row row-cols-lg-4 row-cols-2 align-items-center justify-content-center text-center">
                        <div class="text-start text-lg-start text-md-center">
                            <img src="${item.author.img}"
                                class="author-img img-fluid position-absolute" alt="">
                            <span class="d-inline-block ms-5 ps-2 lh-1">
                                <h3 class="fs-6 fw-bolder">${get_valid(item.author.name)}</h3>
                                <p class="fs-6 m-0">${get_valid(item.author.published_date).split(" ")[0]}
                                </p>
                            </span>
                        </div>
                        <span class="d-none d-md-inline"><i class="fa fa-eye"></i> ${item.total_view}</span>
                        <div class="position-relative d-none d-md-inline">
                            <div class="rating-box">
                                <div class="rating" style="width:${item.rating.number * 10 + 50}%;"></div>
                            </div>
                        </div>
                        <span class="text-end text-lg-end text-md-center"><a href="#" data-id="${item._id}" class="btn btn-default fs-4"><i
                                    class="fa-solid fa-arrow-right"></i>
                            </a></span>
                    </div>
                </div>
            </div>
        </div>
        </div>`;

    });
    posts_div.innerHTML = html;

    if (html != '') {
        document.querySelectorAll(".article a").forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                let id = el.getAttribute("data-id");

                CallAPI("https://openapi.programming-hero.com/api/news/" + id, function (res) {
                    let html = '';
                    if (res.status) {
                        let item = res.data[0];
                        html += `<div><img src="${item.image_url}" class="w-100"></div><h5 class="h2 mt-3 p-0">${get_valid(item.title)}</h5>
                        <p class="my-3">${item.details}</p>
                        <div class="position-relative row row-cols-lg-3 row-cols-1 align-items-center justify-content-center text-center">
                            <div class="text-start text-lg-start text-md-center">
                                <img src="${item.author.img}"
                                    class="author-img img-fluid position-absolute" alt="">
                                <span class="d-inline-block ms-5 ps-2 lh-1">
                                    <h3 class="fs-6 fw-bolder">${get_valid(item.author.name)}</h3>
                                    <p class="fs-6 m-0">${get_valid(item.author.published_date).split(" ")[0]}
                                    </p>
                                </span>
                            </div>
                            <span class="d-none d-md-inline"><i class="fa fa-eye"></i> ${item.total_view}</span>
                            <div class="position-relative d-none d-md-inline">
                                <div class="rating-box">
                                    <div class="rating" style="width:${item.rating.number * 10 + 50}%;"></div>
                                </div>
                            </div>
                        </div>`;
                    }
                    modalEl.querySelector('.modal-body').innerHTML = html;
                    if (html != '') {
                        modal.show();
                    }
                });
            })
        });
    }
}
