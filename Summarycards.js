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
  '#3366CC', '#DC3912', '#FF9900', '#109618',
  '#990099', '#0099C6', '#DD4477', '#66AA00',
  '#B82E2E', '#316395'
];

// unique rejection‐type palette (distinct from defaultColors)
const REJECTION_COLORS = [
  '#8B0000', // dark red
  '#006400', // dark green
  '#00008B', // dark blue
  '#8B008B', // dark magenta
  '#FF1493', // deep pink
  '#00CED1', // dark turquoise
  '#FFD700', // gold
  '#800000', // maroon
  '#2F4F4F', // dark slate
  '#FF4500'  // orange red
];

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
        color: REJECTION_COLORS[idx % REJECTION_COLORS.length]
      }))
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











read below SummaryCards.js file Carefully. in this file Currently We use Fix Colors for Priority Wise chart.it is fine
Also Use Fix and Unique Colors for rejection Types .
  and we already use defalut colors for partation .
  So Add Unique Colors for rejection types .Make Sure dont use same Colors Use diffrent colors .Diffrent means diffrent from default colors.

  Dont change another functions.
  Give me Updated Js file as per my requirnment.
  

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
  '#3366CC', '#DC3912', '#FF9900', '#109618',
  '#990099', '#0099C6', '#DD4477', '#66AA00',
  '#B82E2E', '#316395'
];

export default function SummaryCards({ summary, filters, rawAlarms }) {
  if (!summary) return null;

  // Destructure with defaults
  const {
    rejectionTypeWise = {},
    regionWise = {},
    monthWise = {},
    locationWise = {},
    operatorWise = {}
  } = summary;

  // --- 1. Rejection Stats (existing logic) ---
  function getRejectionStats() {
    let entries;
    if (!filters.region) {
      entries = Object.entries(rejectionTypeWise);
    } else if (filters.region && !filters.location) {
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
        color: defaultColors[idx % defaultColors.length]
      }))
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

  // --- 4. Operator Wise (from summary.operatorWise) ---
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
  const partColors=defaultColors.slice(0,partLabels.length);

  // const partColors = defaultColors.slice(opLabels.length, opLabels.length + partLabels.length);

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
