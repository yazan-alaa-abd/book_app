'use strict';
// ......................................................................................IMPORTS
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const path = require('path');
const pg = require('pg');
const { title } = require('process');

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
app.get('/books/:id', handelSingularBook)
app.get('*', handle404);

// ...........................................................................HANDLERS FUNCTIONS

// let dbQuery = 'INSERT INTO books (author, title,isbn,image_url, description) VALUES ($1, $2 , $3 , $4 , $5)';
// let saveValues = [
//     "Karen M. Ross",
//     "Index to the English Catalogue of Books ...",
//     "123-4567-789",
//     "http://books.google.com/books/content?id=LK7fAAAAMAAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
//     "description An essential handbook for international lawyers and students Focusing on vocabulary, Essential Legal English in Context introduces the US legal system and its terminology. Designed especially for foreign-trained lawyers and students whose first language is not English, the book is a must-read for those who want to expand their US legal vocabulary and basic understanding of US government. Ross uses a unique approach by selecting legal terms that arise solely within the context of the levels and branches of US government, including terminology related to current political issues such as partisanship. Inspired by her students’ questions over her years of teaching"

// ]; 

// client.query(dbQuery , saveValues)

function handelHome(req, res) {
    let selectQuery = 'SELECT * FROM books;';

    client.query(selectQuery)
        .then(data => {
            // console.log(data.rows[1].id);
            res.render('pages/index', { data: data.rows, total: data.rowCount })
        })
        .catch(error => console.log(error))
}

function handelSingularBook(req , res) {
    // console.log(req.body)
    let query = 'SELECT * FROM books where id =$1';
    let saveValue = [req.params.id];
    client.query(query , saveValue).then( data =>{
        
        let object = {
            item:data.rows[0]
        }
        res.render('pages/books/detail' , object);
    });
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
