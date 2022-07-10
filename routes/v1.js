const express = require('express')
const transCon = require('../controllers/transactions')
const typesCon = require('../controllers/types')

const router = express.Router()

router.get('/api/transactions/data', transCon.getData)
router.get('/api/transactions/stat', transCon.getStat)
router.post('/api/transactions', transCon.addTransaction)
router.patch('/api/transactions/:id', transCon.editTransaction)
router.delete('/api/transactions/:id', transCon.deleteTransaction)


module.exports = router;
