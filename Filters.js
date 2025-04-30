Dashboard.js


import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Typography, Container } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Filters      from '../components/Filters';
import SummaryCards from '../components/SummaryCards';
import AlarmCard    from '../components/AlarmCard';
import { getAlarmSummary, getRawAlarms } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary]     = useState(null);
  const [rawAlarms, setRawAlarms] = useState([]);
  const [filters, setFilters]     = useState({ region: '', location: '', month: '' });

  // Fetch data once
  useEffect(() => {
    Promise.all([ getAlarmSummary(), getRawAlarms() ])
      .then(([sumRes, rawRes]) => {
        setSummary(sumRes.data);
        setRawAlarms(rawRes.data);
      })
      .catch(console.error);
  }, []);

  // Region options
  const regionOptions = useMemo(
    () => (summary ? Object.keys(summary.regionWise) : []),
    [summary]
  );

  // Map region → locations
  const regionLocationsMap = useMemo(() => {
    const map = {};
    regionOptions.forEach(region => {
      map[region] = Array.from(
        new Set(rawAlarms.filter(a => a.Region === region).map(a => a.Location))
      );
    });
    return map;
  }, [rawAlarms, regionOptions]);

  // Build slideshow (global + each region)
  const slidesRef = useRef([]);
  const slideIdx  = useRef(0);
  useEffect(() => {
    if (!summary) return;
    const slides = [{ region: '', location: '' }];
    regionOptions.forEach(region => slides.push({ region, location: '' }));
    slidesRef.current = slides;
    slideIdx.current   = 0;
    setFilters(slides[0]);
    const intervalId = setInterval(() => {
      slideIdx.current = (slideIdx.current + 1) % slidesRef.current.length;
      setFilters(slidesRef.current[slideIdx.current]);
    }, 30_000);
    return () => clearInterval(intervalId);
  }, [summary, regionOptions]);

  // —— MISSING PIECE ——  
  // Compute filteredSummary based on filters
  const filteredSummary = useMemo(() => {
    if (!summary) return null;
    const fs = { ...summary };
    if (filters.region) {
      fs.regionWise   = { [filters.region]: summary.regionWise[filters.region] };
      fs.locationWise = {};
      (regionLocationsMap[filters.region] || [])
        .filter(loc => !filters.location || loc === filters.location)
        .forEach(loc => {
          fs.locationWise[loc] = summary.locationWise[loc];
        });
    }
    // Note: month filtering is handled in AlarmCard, not summary
    return fs;
  }, [summary, filters, regionLocationsMap]);
  // —— END MISSING PIECE ——

  if (!summary) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        p: 0,
        m: 0,
        overflowX: 'hidden'
      }}
    >
      {/* Full-width bordered header */}
      <Box
        component="header"
        sx={{
          width: '100%',
          borderBottom: '3px solid #1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 4,
          bgcolor: '#e3f2fd'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon fontSize="large" />
          <Typography variant="h4">Alarm Analysis Dashboard</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link to="/">➤ Dashboard</Link>
          <Link to="/alarms">➤ Raw Alarms</Link>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ py: 4 }}>
        <from autoComplete="off" noValidate>
        <Filters
          filters={filters}
          setFilters={setFilters}
          regionOptions={regionOptions}
          locationOptions={filters.region ? regionLocationsMap[filters.region] : []}
        />

        <AlarmCard
          summary={filteredSummary}
          rawAlarms={rawAlarms}
          filters={filters}
          setFilters={setFilters}
        />
        </from>

        <SummaryCards
          summary={filteredSummary}
          filters={filters}
          rawAlarms={rawAlarms}
        />
      </Container>
    </Box>
  );
}





Filters.js



import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const Filters = ({
  filters,
  setFilters,
  regionOptions = [],
  locationOptions = []
}) => {
  const handleChange = (field) => (e) =>
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value,
      ...(field === 'region' && { location: '' })
    }));

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: 16 }}>
      <TextField
       id="region-select"
       autoComplete="off"
       InputLabelProps={{htmlFor: 'region-select' }}
        select
        label="Region"
        value={filters.region}
        onChange={handleChange('region')}
        style={{ minWidth: 150 }}
      >
        <MenuItem value="">Global</MenuItem>
        {regionOptions.map(region => (
          <MenuItem key={region} value={region}>
            {region}
          </MenuItem>
        ))}
      </TextField>

      {filters.region && (
        <TextField
          id="location-select"
          autoComplete="off"
          InputLabelProps={{ htmlFor: 'location-select' }}
          select
          label="Location"
          value={filters.location}
          onChange={handleChange('location')}
          style={{ minWidth: 200 }}
        >
          <MenuItem value="">All Locations</MenuItem>
          {locationOptions.map(loc => (
            <MenuItem key={loc} value={loc}>
              {loc}
            </MenuItem>
          ))}
        </TextField>
      )}
    </div>
  );
};

export default Filters;





AlarmCard.js



import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, MenuItem } from '@mui/material';

export default function AlarmCard({ summary, rawAlarms, filters, setFilters }) {
  if (!summary) return null;

  // derive dynamic months from summary.monthWise
  const monthOptions = summary.monthWise ? Object.keys(summary.monthWise) : [];

  // Compute dynamic total:
  const totalAlarms = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    if (filters.month) {
      // assume a.Month field in 'YYYY-MM' format
      if (a.Month !== filters.month) return false;
    }
    return true;
  }).length;

  // Compute dynamic responseSentPercentage:
  const sentCount = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    if (filters.month && a.Month !== filters.month) return false;
    return a['Action Taken'] && a['Action Taken'] !== 'Not Sent';
  }).length;
  const responseSentPercentage = totalAlarms
    ? `${((sentCount / totalAlarms) * 100).toFixed(2)}%`
    : '0%';

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Alarms */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Total Alarms
            </Typography>
            <Typography variant="h4">
              {totalAlarms}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Response Sent % */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Response Sent %
            </Typography>
            <Typography variant="h4">
              {responseSentPercentage}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Month Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <TextField
            id="month-select"

            autoComplete="off"
            InputLabelProps={{ htmlFor: 'month-select' }}
              select
              fullWidth
              label="Month"
              value={filters.month || ''}
              onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
              variant="outlined"
            >
              <MenuItem value="">All Months</MenuItem>
              {monthOptions.map(m => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

