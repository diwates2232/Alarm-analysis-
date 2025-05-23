   // --- 6. Month Wise ---
-  const monthCounts = filtered.reduce((acc, a) => {
-    acc[a.Month] = (acc[a.Month] || 0) + 1;
-    return acc;
-  }, {});
-  const monthLabels = Object.keys(monthCounts);
-  const monthValues = monthLabels.map(m => monthCounts[m]);
-  const monthColors = defaultColors.slice(0, monthLabels.length);
+  const monthCounts = filtered.reduce((acc, a) => {
+    // first try a.Month, otherwise extract from a.Date
+    const monthKey = a.Month
+      || new Date(a.Date).toLocaleString('en-US', { month: 'short' });
+    if (!monthKey) return acc;
+    acc[monthKey] = (acc[monthKey] || 0) + 1;
+    return acc;
+  }, {});
+  const monthLabels = Object.keys(monthCounts).sort((a, b) => {
+    // sort by calendar order
+    const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
+    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
+  });
+  const monthValues = monthLabels.map(m => monthCounts[m]);
+  const monthColors = defaultColors.slice(0, monthLabels.length);







import React from 'react';
import MyChart from './Chart';
import { Card, CardContent, Typography, Grid } from '@mui/material';

// fixed priority colors
const PRIORITY_COLORS = {
  High: '#DC3912',
  Medium: '#FF9900',
  Low: '#109618'
};

// strong default palette for other charts
const defaultColors = [
  '#FF9900', '#109618', '#FED06A', '#DC3912',
  '#990099', '#0099C6', '#C1D82F', '#66AA00',
  '#3366CC', '#B82E2E', '#316395', '#71C9CD'
];

// unique fallback palette for rejection types (distinct from defaultColors)
const REJECTION_COLORS = [
  '#006400', '#00008B', '#8B008B', '#FF1493',
  '#00CED1', '#2F4F4F', '#6f1c03', '#ff9a00'
];

// explicit mappings for key rejection types
const REJECTION_COLOR_MAP = {
  'Wrong PIN': '#109618',
  'Clearance - Access Violation': '#FEDC56',
  'Expired': '#FF4F00',
  'Disabled Badge': '#ED9121'
};

export default function SummaryCards({ summary, filters, rawAlarms }) {
  if (!summary) return null;

  const {
    rejectionTypeWise = {},
    regionWise = {},
    locationWise = {},
    operatorWise = {}
  } = summary;

  // 1. Rejection Stats (unchanged) …
  function getRejectionStats() {
    let entries;
    if (!filters.region) {
      entries = Object.entries(rejectionTypeWise);
    } else if (!filters.location) {
      const total = regionWise[filters.region]?.count || 0;
      const byType = rawAlarms
        .filter(a => a.Region === filters.region)
        .reduce((acc, a) => {
          acc[a.Rejection] = (acc[a.Rejection] || 0) + 1;
          return acc;
        }, {});
      entries = Object.entries(byType).map(
        ([type, count]) => [type, { count, percentage: total ? `${((count/total)*100).toFixed(2)}%` : '0%' }]
      );
    } else {
      const total = locationWise[filters.location]?.count || 0;
      const byType = rawAlarms
        .filter(a => a.Region === filters.region && a.Location === filters.location)
        .reduce((acc, a) => {
          acc[a.Rejection] = (acc[a.Rejection] || 0) + 1;
          return acc;
        }, {});
      entries = Object.entries(byType).map(
        ([type, count]) => [type, { count, percentage: total ? `${((count/total)*100).toFixed(2)}%` : '0%' }]
      );
    }

    return entries
      .map(([type, info], idx) => ({
        type,
        count: info.count,
        percentage: info.percentage,
        color: REJECTION_COLOR_MAP[type] || REJECTION_COLORS[idx % REJECTION_COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  }
  const rejectionStats = getRejectionStats();

  // 2. Filter rawAlarms by region/location/month (unchanged)
  const filtered = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    if (filters.month && a.Month !== filters.month) return false;
    return true;
  });

  // 3. Priority Wise (unchanged) …
  const prCounts = filtered.reduce((acc, a) => {
    const p = a['CCURE Incident Priority'];
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const prLabels = Object.keys(prCounts);
  const prValues = prLabels.map(l => prCounts[l]);
  const prColors = prLabels.map(l => PRIORITY_COLORS[l] || '#999');

  // 4. Operator Wise (unchanged) …
  const opCountsObj = operatorWise || {};
  const opLabels = Object.keys(opCountsObj);
  const opValues = opLabels.map(l => opCountsObj[l].count || 0);
  const opColors = defaultColors.slice(0, opLabels.length);

  // 5. Partition Data (unchanged) …
  const partitionObj = !filters.region
    ? Object.fromEntries(Object.entries(regionWise).map(([r, info]) => [r, info.count || 0]))
    : filtered.reduce((acc, a) => {
        acc[a.Location] = (acc[a.Location] || 0) + 1;
        return acc;
      }, {});
  const partLabels = Object.keys(partitionObj);
  const partValues = partLabels.map(l => partitionObj[l]);
  const partColors = defaultColors.slice(0, partLabels.length);

  // 6. Month Wise — **UPDATED** to use the same `filtered` data
  const monthCounts = filtered.reduce((acc, a) => {
    acc[a.Month] = (acc[a.Month] || 0) + 1;
    return acc;
  }, {});
  const monthLabels = Object.keys(monthCounts);
  const monthValues = monthLabels.map(m => monthCounts[m]);
  const monthColors = defaultColors.slice(0, monthLabels.length);

  // 7. Location Wise (unchanged) …
  const locLabels = Object.keys(locationWise);
  const locValues = locLabels.map(l => locationWise[l].count || 0);
  const locColors = defaultColors.slice(0, locLabels.length);

  return (
    <>
      {/* Rejection-Type Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {rejectionStats.map(({ type, count, percentage, color }) => (
          <Grid item xs={12} sm={6} md={3} key={type}>
            <Card sx={{ border: `2px solid ${color}`, backgroundColor: color, color: '#fff' }}>
              <CardContent>
                <Typography variant="subtitle2">{type}</Typography>
                <Typography variant="h6">{count}</Typography>
                <Typography variant="body2">{percentage}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Partition / Priority / Location */}
      <Grid container spacing={5} sx={{ mb: 4 }}>
        {partLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {!filters.region ? 'Global Partition' : `${filters.region} → Location`}
                </Typography>
                <MyChart
                  type="doughnut"
                  data={{ labels: partLabels, values: partValues, bgColors: partColors, borderColor: partColors }}
                  height={600}
                  width={650}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {prLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Priority Wise</Typography>
                <MyChart
                  type="pie"
                  data={{ labels: prLabels, values: prValues, bgColors: prColors, borderColor: prColors }}
                  height={600}
                  width={650}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {locLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Location Wise</Typography>
                <MyChart
                  type="line"
                  data={{ labels: locLabels, values: locValues, bgColors: locColors, borderColor: locColors }}
                  options={{
                    scales: {
                      x: { title: { display: true, text: 'Location' } },
                      y: { title: { display: true, text: 'Alarm Count' } }
                    }
                  }}
                  height={600}
                  width={900}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Month / Operator */}
      <Grid container spacing={5}>
        {monthLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Month Wise</Typography>
                <MyChart
                  type="line"
                  data={{
                    labels: monthLabels,
                    values: monthValues,
                    bgColors: monthColors,
                    borderColor: monthColors
                  }}
                  options={{
                    scales: {
                      x: { title: { display: true, text: 'Month' } },
                      y: { title: { display: true, text: 'Alarm Count' } }
                    }
                  }}
                  height={600}
                  width={600}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {opLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Operator Wise</Typography>
                <MyChart
                  type="bar"
                  data={{ labels: opLabels, values: opValues, bgColors: opColors, borderColor: opColors }}
                  height={600}
                  width={800}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}














Read carefully SummaryCards.js File and solve above issue and Give me Updated 
js file carefully dont change another functions.


import React from 'react';
import MyChart from './Chart';
import { Card, CardContent, Typography, Grid } from '@mui/material';

// fixed priority colors
const PRIORITY_COLORS = {
  High: '#DC3912',
  Medium: '#FF9900',
  Low: '#109618'
};

// strong default palette for other charts
const defaultColors = [
    '#FF9900', '#109618', ' #FED06A','#DC3912',
  '#990099', '#0099C6','#C1D82F', '#66AA00','#3366CC',
  '#B82E2E', '#316395','#71C9CD'
];

// unique fallback palette for rejection types (distinct from defaultColors)
const REJECTION_COLORS = [
  '#006400', // dark green
  '#00008B', // dark blue
  '#8B008B', // dark magenta
  '#FF1493', // deep pink
  '#00CED1', // dark turquoise
  '#2F4F4F', // dark slate
  '#6f1c03', // maroon
  '#ff9a00', // orange red
];

// explicit mappings for key rejection types
const REJECTION_COLOR_MAP = {
  'Wrong PIN': '#109618',                       // green
  'Clearance - Access Violation': '#FEDC56',      // gold  
  'Expired': '#FF4F00',                         // dark red
  'Disabled Badge': '#ED9121'             // orange
};

export default function SummaryCards({ summary, filters, rawAlarms }) {
  if (!summary) return null;

  const {
    rejectionTypeWise = {},
    regionWise = {},
    monthWise = {},
    locationWise = {},
    operatorWise = {}
  } = summary;

  // --- 1. Rejection Stats with unique colors ---
  function getRejectionStats() {
    let entries;
    if (!filters.region) {
      entries = Object.entries(rejectionTypeWise);
    } else if (!filters.location) {
      const total = regionWise[filters.region]?.count || 0;
      const byType = rawAlarms
        .filter(a => a.Region === filters.region)
        .reduce((acc, a) => {
          acc[a.Rejection] = (acc[a.Rejection] || 0) + 1;
          return acc;
        }, {});
      entries = Object.entries(byType).map(
        ([type, count]) => [
          type,
          { count, percentage: total ? `${((count/total)*100).toFixed(2)}%` : '0%' }
        ]
      );
    } else {
      const total = locationWise[filters.location]?.count || 0;
      const byType = rawAlarms
        .filter(a => a.Region === filters.region && a.Location === filters.location)
        .reduce((acc, a) => {
          acc[a.Rejection] = (acc[a.Rejection] || 0) + 1;
          return acc;
        }, {});
      entries = Object.entries(byType).map(
        ([type, count]) => [
          type,
          { count, percentage: total ? `${((count/total)*100).toFixed(2)}%` : '0%' }
        ]
      );
    }

    return entries
      .map(([type, info], idx) => {
        // pick explicit map color or fallback
        const color =
          REJECTION_COLOR_MAP[type] ||
          REJECTION_COLORS[idx % REJECTION_COLORS.length];
        return {
          type,
          count: info.count,
          percentage: info.percentage,
          color
        };
      })
      .sort((a, b) => b.count - a.count);
  }
  const rejectionStats = getRejectionStats();

  // --- 2. Filter rawAlarms by region, location, month ---
  const filtered = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    if (filters.month && a.Month !== filters.month) return false;
    return true;
  });

  // --- 3. Priority Wise ---
  const prCounts = filtered.reduce((acc, a) => {
    const p = a['CCURE Incident Priority'];
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const prLabels = Object.keys(prCounts);
  const prValues = prLabels.map(l => prCounts[l]);
  const prColors = prLabels.map(l => PRIORITY_COLORS[l] || '#999');

  // --- 4. Operator Wise ---
  const opCountsObj = operatorWise || {};
  const opLabels = Object.keys(opCountsObj);
  const opValues = opLabels.map(l => opCountsObj[l].count || 0);
  const opColors = defaultColors.slice(0, opLabels.length);

  // --- 5. Partition Data ---
  const partitionObj = !filters.region
    ? Object.fromEntries(
        Object.entries(regionWise).map(([r, info]) => [r, info.count || 0])
      )
    : filtered.reduce((acc, a) => {
        acc[a.Location] = (acc[a.Location] || 0) + 1;
        return acc;
      }, {});
  const partLabels = Object.keys(partitionObj);
  const partValues = partLabels.map(l => partitionObj[l]);
  const partColors = defaultColors.slice(0, partLabels.length);

  // --- 6. Month Wise ---
  const monthLabels = Object.keys(monthWise);
  const monthValues = monthLabels.map(m => monthWise[m].count || 0);
  const monthColors = defaultColors.slice(0, monthLabels.length);

  // --- 7. Location Wise ---
  const locLabels = Object.keys(locationWise);
  const locValues = locLabels.map(l => locationWise[l].count || 0);
  const locColors = defaultColors.slice(0, locLabels.length);

  return (
    <>
      {/* Rejection-Type Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {rejectionStats.map(({ type, count, percentage, color }) => (
          <Grid item xs={12} sm={6} md={3} key={type}>
            <Card sx={{ border: `2px solid ${color}`, backgroundColor: color, color: '#fff' }}>
              <CardContent>
                <Typography variant="subtitle2">{type}</Typography>
                <Typography variant="h6">{count}</Typography>
                <Typography variant="body2">{percentage}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Partition / Priority / Location */}
      <Grid container spacing={5} sx={{ mb: 4 }}>
        {partLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {!filters.region ? 'Global Partition' : `${filters.region} → Location`}
                </Typography>
                <MyChart
                  type="doughnut"
                  data={{ labels: partLabels, values: partValues, bgColors: partColors, borderColor: partColors }}
                  height={600}
                  width={650}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {prLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Priority Wise</Typography>
                <MyChart
                  type="pie"
                  data={{ labels: prLabels, values: prValues, bgColors: prColors, borderColor: prColors }}
                  height={600}
                  width={650}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {locLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Location Wise</Typography>
                <MyChart
                  type="line"
                  data={{ labels: locLabels, values: locValues, bgColors: locColors, borderColor: locColors }}
                  options={{
                    scales: {
                      x: { title: { display: true, text: 'Location' } },
                      y: { title: { display: true, text: 'Alarm Count' } }
                    }
                  }}
                  height={600}
                  width={900}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Month / Operator */}
      <Grid container spacing={5}>
        {monthLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Month Wise</Typography>
                <MyChart
                  type="line"
                  data={{ labels: monthLabels, values: monthValues, bgColors: monthColors, borderColor: monthColors }}
                  options={{
                    scales: {
                      x: { title: { display: true, text: 'Month' } },
                      y: { title: { display: true, text: 'Alarm Count' } }
                    }
                  }}
                  height={600}
                  width={600}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {opLabels.length > 0 && (
          <Grid item xs={400} md={200}>
            <Card sx={{ border: '1px solid #ccc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Operator Wise</Typography>
                <MyChart
                  type="bar"
                  data={{ labels: opLabels, values: opValues, bgColors: opColors, borderColor: opColors }}
                  height={600}
                  width={800}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}


