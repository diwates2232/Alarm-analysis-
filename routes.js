
const express = require('express');
const router = express.Router();
const { getAlarmSummary, getRawAlarms } = require('../controllers/alarmController');

router.get('/summary', getAlarmSummary);
router.get('/raw', getRawAlarms);

module.exports = router;
