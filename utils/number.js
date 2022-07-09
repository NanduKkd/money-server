exports.fillDigits = (num, digits) => {
	num += ''
	while(num.length<digits) num = '0'+num;
	return num;
}
