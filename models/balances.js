// others owe you
const mongoose = require('mongoose')

const TypeSchema = mongoose.Schema({
	datestamp: {
		unique: true,
		required: true,
		type: Number,
	},
	amount: {
		required: true,
		type: Number,
	}
})

module.exports = mongoose.model('balance', TypeSchema)
