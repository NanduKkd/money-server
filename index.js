const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const transCon = require('./controllers/transactions')
const typesCon = require('./controllers/types')


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

app.get('/api/transactions/data', transCon.getData)
app.get('/api/transactions/stat', transCon.getStat)
app.post('/api/transactions', transCon.addTransaction)
app.patch('/api/transactions/:id', transCon.editTransaction)
app.delete('/api/transactions/:id', transCon.deleteTransaction)

app.listen(3001, () => {
	console.log('Listening on port 3001')
})
