const TypeModel = require('../models/types')
const TransactionModel = require('../models/transactions')

exports.getTypes = async(req, res) => {
	try {
		const data = await TypeModel.find()
		res.status(200).json(data)
	} catch (error) {
		res.status(500).end()
		console.warn(error)
	}
}

exports.getType = async(req, res) => {
	try {
		const data = await TypeModel.findOne({ _id: req.params.id })
		if(!data) return res.status(404).end()
		res.status(200).json(data)
	} catch (error) {
		res.status(500).end()
		console.warn(error)
	}
}

exports.addType = async(req, res) => {
	const data = new TypeModel({
		isIncome: req.body.isIncome,
		name: req.body.name
	})
	try {
		await data.save()
		res.status(204)
	} catch (error) {
		res.status(500).end()
		console.warn(error)
	}
}

exports.editType = async(req, res) => {
	try {
		await TypeModel.findOneAndUpdate({ _id: req.params._id }, req.body)
		res.status(204).end()
	} catch (error) {
		res.status(500).end()
		console.warn(error)
	}
}

exports.deleteType = async(req, res) => {
	try {
		await TypeModel.deleteOne({ _id: req.params._id })
		res.status(204).end()
	} catch (error) {
		res.status(500).end()
		console.warn(error)
	}
}
