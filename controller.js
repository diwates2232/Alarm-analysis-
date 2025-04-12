const { loadExcelData } = require('../services/excelService');

const getAlarmSummary = (req, res) => {
    const data = loadExcelData();

    const summary = {
        totalAlarms: data.length,
        alarmsByRegion: {},
        alarmsBySeverity: {},
        reoccurredCount: 0
    };

    data.forEach(row => {
        const region = row['Region'] || 'Unknown';
        const severity = row['CCURE Incident Level'] || 'Unknown';
        const reoccurred = row['If Reoccurred (Yes/No)'] === 'Yes';

        summary.alarmsByRegion[region] = (summary.alarmsByRegion[region] || 0) + 1;
        summary.alarmsBySeverity[severity] = (summary.alarmsBySeverity[severity] || 0) + 1;

        if (reoccurred) summary.reoccurredCount++;
    });

    res.json(summary);
};

const getRawAlarms = (req, res) => {
    const data = loadExcelData();
    res.json(data);
};

module.exports = {
    getAlarmSummary,
    getRawAlarms
};
