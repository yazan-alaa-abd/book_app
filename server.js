'use strict';
// The imports
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const path = require('path');
const { json } = require('express');

// ............................................................................ configurations 
let app = express();
app.use(cors());
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

// .............................................................................routes-endPoint
app.get('/', handelHome);
app.post('/book', hanelSearch);
app.get('/new', handelSearchForm);


// ................................................................................... handlers
function handelHome(req, res) {
    res.render('pages/index')
}

function handelSearchForm(req, res) {
    // console.log(req.query);
    res.render('pages/searches/new')
}


function hanelSearch(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes';
    // console.log('handelSeach data ... ', req.body);
    var objectOfData = {
        q: req.body.search + ' in' + req.body.term
    }

    superagent.get(url).query(objectOfData).then(data => {
        let books = data.body.items.map(book => {
            return new BookResult(book);
        });
        res.render('pages/searches/show', { booksList: books });
    })
}
// .................................................................... data entity
function BookResult(book) {
    this.title = book.volumeInfo.title || 'no title';
    this.author = book.volumeInfo.authors || 'Author unkown';
    this.description = book.volumeInfo.description || 'No discription';
    this.imgURL = book.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
}

app.listen(PORT, () => {
    console.log('server is running perfectly .. ', PORT)
})