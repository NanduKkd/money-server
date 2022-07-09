const mongoose = require('mongoose')

const TransSchema = mongoose.Schema({
	type_id: {
		type: mongoose.ObjectId,
		required: true
	},
	isIncome: {
		type: Boolean,
		required: true
	},
	isOoy: {
		type: Boolean,
		default: false,
		validate: {
			validator: function(v){
				return v&&(this.isYoo||this.isIncome)?false:true;
			},
			message: () => "Check isOoy, isYoo, isIncome"
		},
	},
	isYoo: {
		type: Boolean,
		default: false,
		validate: {
			validator: function(v){
				return v&&(this.isOoy||!this.isIncome)?false:true;
			},
			message: () => "Check isOoy, isYoo, isIncome"
		},
	},
	name: String,
	amount: {
		type: Number,
		required: true
	},
	datestamp: {
		type: Number,
		required: true
	}
})

module.exports = mongoose.model('transaction', TransSchema)
