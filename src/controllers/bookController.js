const express = require('express')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const crypto = require('crypto')
const cloudinary = require('cloudinary').v2

const router = express.Router()

const Book = require('../models/Book')
const Author = require('../models/Author')


router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.pubBefore){
        query = query.lte('pubDate', req.query.pubBefore)
    }
    if(req.query.pubAfter){
        query = query.gte('pubDate', req.query.pubAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            cloudinary: cloudinary,
            searchFilters: req.query
        })
    } catch(error){
        res.redirect('/')
    }
})


router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})


router.post('/new', multipartMiddleware, async (req, res) => {
    const filePath = req.files.file.path
    const imgID = crypto.randomBytes(8).toString('hex')
    
    const book = new Book({
        title: req.body.title,
        pubDate: new Date(req.body.pubDate),
        author: req.body.author,
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImage: imgID
    })

    try {
        await cloudinary.uploader.upload(filePath, {
            public_id: `covers/${book.coverImage}`,
            tags: 'cover',
            width: 300,
            height: 450,
            crop: 'scale'
        }, (error, image) => {
                if(error) console.log(error)
            }
        )
        const newBook = await book.save()

        res.redirect(`/books/${newBook.id}`)
    } catch(err) {
        console.log(err)
        renderNewPage(res, book, true)
    }
})

router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/book.ejs', {
            book: book,
            cloudinary: cloudinary
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    }catch{
        res.redirect('/')
    }
})

router.put('/:id/edit', multipartMiddleware, async (req, res) => {
    let filePath = null
    let book

    if(req.files.file.size > 0) filePath = req.files.file.path
    
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.pubDate = new Date(req.body.pubDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description


        if(filePath){
            await cloudinary.uploader.destroy(`covers/${book.coverImage}`)
            const imgID = crypto.randomBytes(8).toString('hex')
            book.coverImage = imgID
            await cloudinary.uploader.upload(
                filePath, {public_id: `covers/${book.coverImage}`, tags: 'cover', width: 300, height: 450, crop: 'scale'}, (error, image) => {
                    if(error) console.log(error)
                }
            )
        }

        await book.save()

        res.redirect(`/books/${book.id}`)
    } catch(err) {
        if(book){
            renderEditPage(res, book, true)
        } else {
            res.redirect('/')
        }
        
    }
})

router.delete('/:id/delete', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        cloudinary.uploader.destroy(`covers/${book.coverImage}`)
        await book.remove()
        res.redirect('/books')
    }catch {
        if(book){
            res.render('books/show', {
                book: book,
                cloudinary: cloudinary,
                error: "Could not remove book"
            })
        }else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}
  
async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}
  
async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
        authors: authors,
        book: book
      }
      if (hasError) {
        if (form === 'edit') {
          params.errorMessage = 'Error Updating Book'
        } else {
          params.errorMessage = 'Error Creating Book'
        }
      }
      res.render(`books/${form}.ejs`, params)
    } catch {
      res.redirect('/books')
    }
  }
module.exports = router
