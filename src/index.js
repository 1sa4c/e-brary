if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({path:'.env'})
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const cloudinary = require('cloudinary').v2
const methodOverride = require('method-override')

cloudinary.config({ 
    cloud_name: process.env.NAME, 
    api_key: process.env.KEY, 
    api_secret: process.env.SECRET
})

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))

const mongo = require('./database')

const port = 3333

const indexController = require('./controllers/indexController')
const authorController = require('./controllers/authorController')
const bookController = require('./controllers/bookController')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', './layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))

const db = mongo.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to mongoose!'))


app.use('/', indexController)
app.use('/authors', authorController)
app.use('/books', bookController)


app.listen(process.env.PORT || port)
