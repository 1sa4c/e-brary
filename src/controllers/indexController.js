const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2

const Book = require('../models/Book')

router.get('/', async (req, res) => {
    let books
    try{
        books = await Book.find().sort({creationDate: 'desc'}).limit(15).exec()
    } catch(error) {
        books = []
    }
    res.render('index', {books: books, cloudinary: cloudinary})
})

module.exports = router