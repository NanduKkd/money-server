exports.aggregateDataUpdate = async(DataModel, datestamp, amountToAdd) => {
	const bOnDay = await DataModel.findOne({ datestamp })
	let prevBalance;
	if(!bOnDay) {
		const bBeforeDay = await DataModel.find({ datestamp: { $lt: datestamp } }, { amount: 1 }).sort({ datestamp: -1 }).limit(1)
		prevBalance = bBeforeDay.length?bBeforeDay[0].amount:0
	} else {
		prevBalance = bOnDay.amount;
	}
	await DataModel.updateOne({datestamp}, { $set: {datestamp, amount: prevBalance+amountToAdd} }, { upsert: true })
		const data2 = await DataModel.find({ datestamp: { $gt: datestamp } })
	if(data2.length) {
		await DataModel.updateMany({ _id: { $in: data2.map(b => b._id) } }, [{ $set: { amount: { $add: ["$amount", amountToAdd] } } }])
	}
}
