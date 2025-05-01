read carefully Js file issue is Total Alarms Count & Response Sent % are render on Ui Twicw time With icon and Without Icon .
render Count Only one time .
  read carefully each line by line and Solve this issue give me Updated js file.


File 1
Alarmcard.js


import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

export default function AlarmCard({ summary, rawAlarms, filters }) {
  if (!summary) return null;

  // apply all filters (region, location, month) to raw alarms
  const filtered = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    if (filters.month && a.Month !== filters.month) return false;
    return true;
  });

  const totalAlarms = filtered.length;
  const sentCount = filtered.filter(a =>
    a['Action Taken'] && a['Action Taken'] !== 'Not Sent'
  ).length;
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
            <Typography variant="h4">{totalAlarms}</Typography>
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
            <Typography variant="h4">{responseSentPercentage}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}




File 2

filters.js


import React from 'react';
import {
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  Typography
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AlarmIcon from '@mui/icons-material/Alarm';
import SendIcon from '@mui/icons-material/Send';

export default function Filters({
  filters,
  setFilters,
  regionOptions = [],
  locationOptions = [],
  monthOptions = [],
  totalAlarms,
  responseSentPercentage
}) {
  const handleChange = field => e =>
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value,
      ...(field === 'region' && { location: '' })
    }));

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
      {/* Region */}
      <Grid item>
        <TextField
          id="region-select"
          label="Region"
          select
          value={filters.region}
          onChange={handleChange('region')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PublicIcon />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">Global</MenuItem>
          {regionOptions.map(region => (
            <MenuItem key={region} value={region}>
              {region}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Location */}
      <Grid item>
        <TextField
          id="location-select"
          label="Location"
          select
          value={filters.location}
          onChange={handleChange('location')}
          disabled={!filters.region}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">All Locations</MenuItem>
          {locationOptions.map(loc => (
            <MenuItem key={loc} value={loc}>
              {loc}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Month */}
      <Grid item>
        <TextField
          id="month-select"
          label="Month"
          select
          value={filters.month}
          onChange={handleChange('month')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthIcon />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">All Months</MenuItem>
          {monthOptions.map(m => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Total Alarms */}
      <Grid item>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
          <AlarmIcon /> Total: {totalAlarms ?? '-'}
        </Typography>
      </Grid>

      {/* Response % */}
      <Grid item>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
          <SendIcon /> Sent: {responseSentPercentage ?? '-'}
        </Typography>
      </Grid>
    </Grid>
  );
}


File 3


dashboard.js




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

  // Fetch data
  useEffect(() => {
    Promise.all([getAlarmSummary(), getRawAlarms()])
      .then(([sumRes, rawRes]) => {
        setSummary(sumRes.data);
        setRawAlarms(rawRes.data);
      })
      .catch(console.error);
  }, []);

  // Regions
  const regionOptions = useMemo(
    () => (summary ? Object.keys(summary.regionWise) : []),
    [summary]
  );

  // Locations by region
  const regionLocationsMap = useMemo(() => {
    const map = {};
    regionOptions.forEach(region => {
      map[region] = Array.from(
        new Set(rawAlarms.filter(a => a.Region === region).map(a => a.Location))
      );
    });
    return map;
  }, [rawAlarms, regionOptions]);

  // Month options
  const monthOptions = useMemo(
    () => (summary ? Object.keys(summary.monthWise) : []),
    [summary]
  );

  // Compute total alarms & response %
  const { totalAlarms, responseSentPercentage } = useMemo(() => {
    const base = rawAlarms.filter(a => {
      if (filters.region && a.Region !== filters.region) return false;
      if (filters.location && a.Location !== filters.location) return false;
      if (filters.month && a.Month !== filters.month) return false;
      return true;
    });
    const total = base.length;
    const sent = base.filter(a =>
      a['Action Taken'] && a['Action Taken'] !== 'Not Sent'
    ).length;
    return {
      totalAlarms: total,
      responseSentPercentage: total
        ? `${((sent / total) * 100).toFixed(2)}%`
        : '0%'
    };
  }, [rawAlarms, filters]);

  // Auto‐slide filters
  const slidesRef = useRef([]);
  const slideIdx  = useRef(0);
  useEffect(() => {
    if (!summary) return;
    const slides = [{ region: '', location: '', month: '' }];
    regionOptions.forEach(region => slides.push({ region, location: '', month: '' }));
    slidesRef.current = slides;
    slideIdx.current   = 0;
    setFilters(slides[0]);
    const id = setInterval(() => {
      slideIdx.current = (slideIdx.current + 1) % slidesRef.current.length;
      setFilters(slidesRef.current[slideIdx.current]);
    }, 30000);
    return () => clearInterval(id);
  }, [summary, regionOptions]);

  // Build filteredSummary for SummaryCards
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
    return fs;
  }, [summary, filters, regionLocationsMap]);

  if (!summary) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', p: 0, m: 0, overflowX: 'hidden' }}>
      {/* Header */}
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
        <form autoComplete="off" noValidate>
          {/* Filters row */}
          <Filters
            filters={filters}
            setFilters={setFilters}
            regionOptions={regionOptions}
            locationOptions={filters.region ? regionLocationsMap[filters.region] : []}
            monthOptions={monthOptions}
            totalAlarms={totalAlarms}
            responseSentPercentage={responseSentPercentage}
          />

          {/* Alarm cards */}
          <AlarmCard
            summary={filteredSummary}
            rawAlarms={rawAlarms}
            filters={filters}
            setFilters={setFilters}
          />
        </form>

        {/* Summary charts */}
        <SummaryCards
          summary={filteredSummary}
          filters={filters}
          rawAlarms={rawAlarms}
        />
      </Container>
    </Box>
  );
}


