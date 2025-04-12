const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// Load Excel and parse
function loadExcelData() {
    const filePath = path.join(__dirname, 'data', 'Alarms.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
}

// Summarize data (basic example)
function getSummary(data) {
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

        // Count by region
        summary.alarmsByRegion[region] = (summary.alarmsByRegion[region] || 0) + 1;

        // Count by severity
        summary.alarmsBySeverity[severity] = (summary.alarmsBySeverity[severity] || 0) + 1;

        // Count reoccurred
        if (reoccurred) summary.reoccurredCount++;
    });

    return summary;
}

// Endpoint: Get alarm summary
app.get('/api/alarms/summary', (req, res) => {
    const data = loadExcelData();
    const summary = getSummary(data);
    res.json(summary);
});

// Endpoint: Get raw alarm data (optional)
app.get('/api/alarms/raw', (req, res) => {
    const data = loadExcelData();
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
