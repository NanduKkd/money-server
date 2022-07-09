// others owe you
const mongoose = require('mongoose')

const TypeSchema = mongoose.Schema({
	datestamp: {
		type: Number,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
})

module.exports = mongoose.model('ooy', TypeSchema)
