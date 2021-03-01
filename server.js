'use strict';
// ......................................................................................IMPORTS
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const path = require('path');
const pg = require('pg');

// ...............................................................................CONFIGURATIONS
let app = express();
app.use(cors());
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));


// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = new pg.Client(process.env.DATABASE_URL);

// ...........................................................................ROUTERS END POINTS
app.get('/', handelHome);
app.post('/searches', hanelSearch);
app.get('/searches/new', handelSearchForm);
app.get('*', handle404);

// ...........................................................................HANDLERS FUNCTIONS
function handelHome(req, res) {
    let selectQuery = 'SELECT * FROM books;';

    client.query(selectQuery)
        .then(data => {
            // console.log(data)
            res.render('pages/index', { data: data.rows, total: data.rowCount })
        })
        .catch(error => console.log(error))
}

function handelSearchForm(req, res) {
    res.render('pages/searches/new')
}

function hanelSearch(req, res) {
    try {
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
    } catch (error) {
        res.send('an error occured : ', error)
    }
}

function handle404(rq, res) {
    res.send('404 page not found')
}

app.get('*', (req, res) => {
    res.send('this route dose not exist !! ')
})

app.get('/error', (req, res) => {
    res.render('pages/error');
})

// ................................................................................. DATA MODEL
function BookResult(book) {
    var modifiedImg = book.volumeInfo.imageLinks.thumbnail.split(":")[1];
    this.title = book.volumeInfo.title || 'no title';
    this.author = book.volumeInfo.authors || 'Author unkown';
    this.description = book.volumeInfo.description || 'No discription';
    this.imgURL = `https:${modifiedImg}`;
}

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log('server is running perfectly .. ', PORT)
        })
    })
    .catch(error => console.log('error occured while connecting to database : ', error))
