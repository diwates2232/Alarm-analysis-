
const express = require('express');
const cors = require('cors');
const alarmRoutes = require('./routes/alarmRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/api/alarms', alarmRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
