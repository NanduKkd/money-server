const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const routes = require('./routes')


mongoose.connect('mongodb://127.0.0.1:27017')
const database = mongoose.connection
database.on('error', err => {
	console.error(err);
})
database.once('connected', () => {
	console.log('Database connected')
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.send("Hello there")
})

app.use(routes)

app.listen(3001, () => {
	console.log('Listening on port 3001')
})
