const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2
const Author = require('../models/Author')
const Book = require('../models/Book')


router.get('/', async (req, res) => {
    let searchFilters = {}
    if(req.query.name){
        searchFilters.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchFilters)
        res.render('authors/index', {authors: authors, searchFilters: req.query})
    } catch(error) {
        res.redirect('/')
    }
})


router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})


router.post('/new', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
        res.redirect(`/authors/${newAuthor.id}`)

    } catch(error){
        res.render('authors/new', {
            author: author,
            error: 'Error on creating new author'
        })
    }
})

router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).exec()
        res.render('authors/author.ejs', {
            author: author,
            books: books,
            cloudinary: cloudinary
        })
    } catch(error) {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id/edit', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)

    } catch(error){
        if(author){
            res.redirect('/')
        } else {
            res.render('/authors/edit', {
                author: author,
                error: 'Error on updating author'
            })
        }
    }
})

router.delete('/:id/delete', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect(`/authors`)

    } catch(error){
        if(author){
            res.redirect(`/authors/${author.id}`)
        } else {
            res.redirect('/')
        }
    }
})

module.exports = router