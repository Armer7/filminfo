"use strict";


let url = 'https://www.omdbapi.com/?apikey=d7c86344';
let searchUrl = '';
let pagination = null;
const films = document.getElementById('films');
const pag = document.getElementById('pagination');
const filmInfo = document.getElementById('filmInfo');

// GET SERVER DATA
function requestDataGet(url, method, body = null) {
  let headers = {
    'Content-Type': 'application/json;charset=utf-8'
  };
  let params = {};
  if (body) {
    params = {
      method: method,
      body: JSON.stringify(body),
      headers
    }
  }
  return fetch(url, params).then(data => {
    let responseData = data.json();
    if (data.ok) {
      return responseData;
    }
    return responseData.then(error => {
      let er = new Error('Error Data');
      er.data = error;
      throw er;
    })
  }).catch(data => {
    console.log(data);
  });
}

// GET DATA FOR SEARCH FILMS
document.addEventListener('submit', function (e) {
  e.preventDefault();
  pagination = null;
  let searchForm = document.forms[0].elements;
  if (searchForm.s.value) {
    searchUrl = `${url}&s=${searchForm.s.value}&type=${searchForm.type.value}`;
    filmsList(searchUrl);
  } else return false
});

// GET LIST FILMS
function filmsList(search, page = 1) {

  requestDataGet(`${search}&page=${page}`, 'GET').then(data => {

    films.previousSibling.innerHTML = 'Films:';
    films.innerHTML = '';

    if (data.Response === 'True') {
      pag.style.display = '';
      let countPage = Math.ceil(+ data.totalResults / 10);
      data.Search.forEach(filmsObj => {
        filmsRender(filmsObj);
      });
      if (pagination === null) {
        pagination = new Pagination(pag, {
          pages: countPage, // pages count
          page: 1,  // selected page
          step: 3   // pages before and after current
        });
      }
    } else {
      films.innerHTML = `<h4 class="text-center m-auto">${data.Error}</h4>`;
      pag.style.display = 'none'
    }
  }).then().catch(data => {
    console.error(data);
  });
}

// RENDER FILM LIST
function filmsRender(filmsObj) {
  let div = document.createElement('div');
  div.className = 'col mb-4';
  div.innerHTML = `
        <div class="card mb-3 h-100">
          <div class="row no-gutters">
            <div class="col-md-4">
              <img alt=${filmsObj.Title} class="card-img" src=${filmsObj.Poster}>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h6 class="card-title">${filmsObj.Type}</h6>
                <p class="card-text"><strong>${filmsObj.Title}</strong></p>
                <p class="card-text h5 year">${filmsObj.Year}</p>
                <button class="btn btn-light btn-block border"  id=${filmsObj.imdbID}
                type="button" onclick="getFilmInfo(event)">Details</button>
              </div>
            </div>
          </div>
        </div>`;
  films.appendChild(div);
}

// GET FILM INFO
function getFilmInfo(e) {
  e.preventDefault();
  let infoUrl = `https://www.omdbapi.com/?apikey=d7c86344&i=${e.target.id}`;
  requestDataGet(infoUrl, 'GET').then(data => {
    if (data.Response === 'True') {
      infoRender(data);
    }
  }).then().catch(data => {
    console.error(data);
  });
}

//RENDER TABLE FILM INFO
function infoRender(info) {

  filmInfo.previousSibling.innerHTML = 'Film info:';
  filmInfo.innerHTML = `
  <div class = "row no-gutters">
        <div class = "col-md-4">
          <img src = ${info.Poster}
               class = "card-img" alt = ${info.Title}>
        </div>
        <div class = "col-md-8">
          <div class = "card-body">
            <table class = "table table-borderless h-100">
              <tbody>
              <tr>
                <th scope = "row">Title:</th>
                <td>${info.Title}</td>
              </tr>
              <tr>
                <th scope = "row">Released:</th>
                <td>${info.Released}</td>
              </tr>
              <tr>
                <th scope = "row">Genre:</th>
                <td>${info.Genre}</td>
              </tr>
              <tr>
                <th scope = "row">Country:</th>
                <td>${info.Country}</td>
              </tr>
              <tr>
                <th scope = "row">Director:</th>
                <td>${info.Director}</td>
              </tr>
              <tr>
                <th scope = "row">Writer:</th>
                <td>${info.Writer}</td>
              </tr>
              <tr>
                <th scope = "row">Actors:</th>
                <td>${info.Actors}</td>
              </tr>
              <tr>
                <th scope = "row">Awards:</th>
                <td>${info.Awards}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
}

// START CLASS PAGINATION
class Pagination {
  constructor(e, pageData) {
    this.e = e;
    this.bodyPagination = e;
    this.htmlList = '';
    this.pages = pageData.pages; // data.size
    this.page = pageData.page;
    this.step = pageData.step;
    this.Init();
    this.Start();
  }

  // pagination creat
  Init() {
    this.e.innerHTML = `
		<li class="page-item">
          <a class="page-link" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
		<li>
		<ul class="pagination"></ul>
    </li>
		<li class="page-item">
         <a class="page-link" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>`;
    this.bodyPagination = this.e.getElementsByTagName('ul')[0];
    // Prev-Next buttons event
    let BtnPrvNxt = this.e.getElementsByTagName('a');
    BtnPrvNxt[0].addEventListener('click', this.Prev.bind(this));
    BtnPrvNxt[1].addEventListener('click', this.Next.bind(this));
  }

  // find pagination type
  Start() {
    if (this.pages < this.step * 2 + 6) {
      this.Add(1, this.pages + 1);
    } else if (this.page < this.step * 2 + 1) {
      this.Add(1, this.step * 2 + 4);
      this.Last();
    } else if (this.page > this.pages - this.step * 2) {
      this.First();
      this.Add(this.pages - this.step * 2 - 2, this.pages + 1);
    } else {
      this.First();
      this.Add(this.page - this.step, this.page + this.step + 1);
      this.Last();
    }
    this.Finish();
  }

// add pages: a-b
  Add(a, b) {
    for (let i = a; i < b; i ++) {
      this.htmlList += `<li class = "page-item"><a class = "page-link">${i}</a></li>`;
    }
  }


  // add last numb page + point
  Last() {
    this.htmlList += `<li class = "page-item inFlex"><i class="iEnd">. . .</i>
<a class = "page-link inline">${this.pages}</a></li>`;
  }

// add first numb page + point
  First() {
    this.htmlList += `<li class = "page-item inFlex"><a class = "page-link inline">1</a>
<i class="iEnd">. . .</i></li>`;
  }


  // Events method
  //pages: method for event
  Click(value) {

    this.page = + value.target.innerHTML;
    let p = this.page;
    this.Start();
    filmsList(searchUrl, p)
  }

  // previous page: method for event
  Prev() {
    this.page --;
    if (this.page < 1) {
      this.page = 1;
    }
    let p = this.page;
    this.Start();
    filmsList(searchUrl, p)
  }

  // next page: method for event
  Next() {
    this.page ++;
    if (this.page > this.pages) {
      this.page = this.pages;
    }
    let p = this.page;
    this.Start();
    filmsList(searchUrl, p)
  }

  // set event for pages
  PagesEvent() {
    let li = this.bodyPagination.getElementsByTagName('li');
    let a = this.bodyPagination.getElementsByTagName('a');
    for (let i = 0; i < a.length; i ++) {
      if (+ a[i].innerHTML === this.page) li[i].className = 'page-item active';
      a[i].addEventListener('click', this.Click.bind(this));
    }
  }

  // render pagination list
  Finish() {
    this.bodyPagination.innerHTML = this.htmlList;
    this.htmlList = '';
    this.PagesEvent();
  }

// END class
}
