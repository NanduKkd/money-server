const mongoose = require('mongoose')

const TypeSchema = mongoose.Schema({
	isIncome: {
		required: true,
		type: Boolean
	},
	name: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model('type', TypeSchema)
