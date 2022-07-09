const { fillDigits } = require('./number')
exports.datestamp = (date, month, year) => new Date(`${year}-${fillDigits(month, 2)}-${fillDigits(date, 2)}T00:00:00+00:00`).getTime()/(24*60*60*1000)
exports.dateFromDs = (ds) => {
	const gmtMillisGap = new Date('2001-06-12T00:00:00').getTime() - new Date('2001-06-12T00:00:00+00:00').getTime()
	return new Date(ds*24*60*60*1000-gmtMillisGap)
}
exports.datestampToday = () => {
	const d = new Date()
	return exports.datestamp(d.getDate(), d.getMonth()+1, d.getFullYear())
}
exports.formatDatestamp = (ds) => {
	const d = exports.dateFromDs(ds);
	return d.getDate()+' '+["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()]
}
