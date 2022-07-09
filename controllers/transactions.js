const TransactionModel = require('../models/transactions')
const BalancesModel = require('../models/balances')
const TypeModel = require('../models/types')
const YooModel = require('../models/yoo')
const OoyModel = require('../models/ooy')
const { fillDigits } = require('../utils/number')
const { aggregateDataUpdate } = require('../utils/data')
const { datestamp, datestampToday, formatDatestamp, dateFromDs } = require('../utils/date')



async function parseList ({ filters, maxDs, minDs, groupIdFromDs=()=>{}, groupTitleFromId=()=>{} }) {
	const data = [];
	const list = await TransactionModel.find({ type: { $nin: filters }, datestamp: maxDs?{ $lt: maxDs, $gte: minDs }:{ $gte: minDs } }).sort({ datestamp: -1 });
	if(!list.length) return []

	let crntGrpId = groupIdFromDs(list[0].datestamp)
	let crntGrpData = {};
	for(const item of list) {
		const itemGrpId = groupIdFromDs(item.datestamp)
		if(crntGrpId!=itemGrpId) {
			if(Object.keys(crntGrpData).length) {
				data.push(groupTitleFromId(crntGrpId))
				data.push(...Object.keys(crntGrpData).map(i => ({ amount: crntGrpData[i].amount, subtitle: crntGrpData[i].subtitle.substring(0,30), type: i })))
			}
			crntGrpData = {}
			crntGrpId = itemGrpId;
		}
		if(!crntGrpData[item.type_id]) crntGrpData[item.type_id] = { amount: 0, subtitle: '' }
		crntGrpData[item.type_id].amount += (item.isIncome?1:-1)*item.amount;
		if(item.name) crntGrpData[item.type_id].subtitle += ", "+item.name.substring(0,10)
	}
	if(Object.keys(crntGrpData).length) {
		data.push(groupTitleFromId(crntGrpId))
		data.push(...Object.keys(crntGrpData).map(i => ({ amount: crntGrpData[i].amount, subtitle: crntGrpData[i].subtitle.substring(0,30), type: i })))
	}
	return data;
}


async function aggregateStat(model, period) {
	const todayDs = datestampToday()
	const list = await model.find({ datestamp: { $gt: todayDs-period } }).sort({ datestamp: 1 })
	const temp = {};
	for(let item of list) {
		temp[item.datestamp] = item.amount;
	}
	const chart = [];
	if(typeof temp[todayDs-period+1] !== "number") {
		temp[todayDs-period+1] = (await model.find({ datestamp: { $lte: todayDs-period } }).sort({ datestamp: -1 }).limit(1))[0]?.amount || 0
	}
	for(let i=todayDs-period+1; i<=todayDs; i++) {
		chart.push(typeof temp[i] === "number" ? temp[i] : chart[chart.length-1]);
	}
	return [ chart[chart.length-1], chart ];
}



exports.getData = async(req, res) => {
	const { period, filters, pageNumber, lastPageFinalDs, pageLength } = req.body;
	const processedFilters = Object.keys(filters).filter(i => filters[i]);
	const dsToday = datestampToday();

	let data = []
	let list = [], currentPageFinalDs
	
	switch(period) {
		case "weekly":
			currentPageFinalDs = (lastPageFinalDs||Math.floor((datestampToday()+4)/7)*7+4)-pageLength*7
			data = await parseList({
				filters: processedFilters,
				maxDs: lastPageFinalDs,
				minDs: currentPageFinalDs,
				groupIdFromDs: (ds) => Math.floor((ds-4)/7),
				groupTitleFromId: (id) => formatDatestamp(id*7+4) + ' - ' + formatDatestamp((id+1)*7+3),
			})
			res.json({currentPageFinalDs, data});
			break;



		case "monthly":
			const lastDate = dateFromDs(lastPageFinalDs-1||datestampToday());
			const crntEndMonthIndex = (lastDate.getFullYear()*12+lastDate.getMonth()-pageLength+1)
			currentPageFinalDs = datestamp(1, crntEndMonthIndex%12+1, Math.floor(crntEndMonthIndex/12))

			data = await parseList({
				filters: processedFilters,
				maxDs: lastPageFinalDs,
				minDs: currentPageFinalDs,
				groupIdFromDs: (ds) => {
					let temp = dateFromDs(ds);
					return temp.getFullYear()*12+temp.getMonth()
				},
				groupTitleFromId: (id) => (
					formatDatestamp(datestamp(1,(id%12)+1,Math.floor(id/12)))
					+
					' - '
					+
					formatDatestamp(datestamp(1,((id+1)%12)+1, Math.floor((id+1)/12))-1)
				),
			})
			res.json({ data, currentPageFinalDs })



		default:
			list = await TransactionModel.find({ type: { $nin: processedFilters } }).sort({ datestamp: -1 }).skip(pageNumber*pageLength).limit(pageLength);
			let lastDs = null;
			for(const item of list) {
				if(item.datestamp!==lastDs) {
					data.push(formatDatestamp(item.datestamp))
					lastDs = item.datestamp;
				}
				data.push(item);
			}
			res.json({ data })
	}
}




exports.getStat = async(req, res) => {
	const period = req.body.period;
	const todayDs = datestampToday();
	let list = await TransactionModel.find({ datestamp: { $gt: todayDs-period } }).sort({ datestamp: -1 })
	
	let totalExp = 0, totalInc = 0;
	const eChartData = [], iChartData = [];

	const tempExp = {}, tempInc = {};

	let contr;

	for(let item of list) {
		if(item.isIncome) {
			contr = tempInc
			totalInc += item.amount;
		} else {
			contr = tempExp
			totalExp += item.amount;
		}
		if(!contr[item.datestamp]) contr[item.datestamp] = 0;
		contr[item.datestamp] += item.amount;
	}
	for(let i=todayDs-period+1; i<=todayDs; i++) {
		eChartData.push(tempExp[i]||0);
		iChartData.push(tempInc[i]||0);
	}

	const [ totalBal, bChart ] = await aggregateStat(BalancesModel, period)
	const [ totalOoy, ooyChart ] = await aggregateStat(OoyModel, period)
	const [ totalYoo, yooChart ] = await aggregateStat(YooModel, period)
	res.json([
		[
			{
				title: "Expense",
				color: "#f00",
				chart: eChartData,
				finalValue: totalExp,
			},
			{
				title: "Income",
				color: "#0f0",
				chart: iChartData,
				finalValue: totalInc,
			},
		],
		[
			{
				title: "Balance",
				color: "#00f",
				chart: bChart,
				finalValue: totalBal,
			},
		],
		[
			{
				title: "You owe others",
				color: "#f00",
				chart: yooChart,
				finalValue: totalYoo,
			},
			{
				title: "Others owe you",
				color: "#0f0",
				chart: ooyChart,
				finalValue: totalOoy,
			},
		],
	])
}





exports.addTransaction = async(req, res) => {
	const dataToSave = new TransactionModel(req.body)
	try {
		const savedData = await dataToSave.save()
		await aggregateDataUpdate(BalancesModel, req.body.datestamp, (req.body.isIncome?1:-1)*req.body.amount)
		if(req.body.isOoy) {
			await aggregateDataUpdate(OoyModel, req.body.datestamp, req.body.amount)
		}
		if(req.body.isYoo) {
			await aggregateDataUpdate(YooModel, req.body.datestamp, req.body.amount)
		}
		res.status(200).json({ _id: savedData._id })
	} catch (error) {
		res.status(400).json({ message: error.message })
	}
}
exports.editTransaction = async(req, res) => {
	try {
		await TransactionModel.findOneAndUpdate({ _id: req.params.id }, req.body)
		res.status(204).end()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
exports.deleteTransaction = async(req, res) => {
	try {
		await TransactionModel.deleteOne({ _id: req.params.id })
		res.status(204).end()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
