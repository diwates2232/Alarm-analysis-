// src/pages/Dashboard.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Typography, Container } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Filters from '../components/Filters';
import AlarmCard from '../components/AlarmCard';
import SummaryCards from '../components/SummaryCards';
import { getAlarmSummary, getRawAlarms } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary]     = useState(null);
  const [rawAlarms, setRawAlarms] = useState([]);
  const [filters, setFilters]     = useState({
    region: '', location: '', month: '', priority: ''
  });

  // Fetch data
  useEffect(() => {
    Promise.all([getAlarmSummary(), getRawAlarms()])
      .then(([sumRes, rawRes]) => {
        setSummary(sumRes.data);
        setRawAlarms(rawRes.data);
      })
      .catch(console.error);
  }, []);

  // helper: full "Month Year" from a date string
  const formatMonthYear = dateStr =>
    new Date(dateStr).toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1) dropdown options
  const regionOptions = useMemo(
    () => summary ? Object.keys(summary.regionWise) : [],
    [summary]
  );

  const locationOptions = useMemo(() => (
    filters.region
      ? Array.from(new Set(
          rawAlarms
            .filter(a => a.Region === filters.region)
            .map(a => a.Location)
        ))
      : []
  ), [rawAlarms, filters.region]);

  const monthOptions = useMemo(() => {
    const all = rawAlarms
      .filter(a =>
        (!filters.region   || a.Region   === filters.region) &&
        (!filters.location || a.Location === filters.location)
      )
      .map(a => formatMonthYear(a.Date));
    return Array.from(new Set(all))
      .sort((a, b) => new Date(a) - new Date(b));
  }, [rawAlarms, filters.region, filters.location]);

  const priorityOptions = useMemo(
    () => Array.from(new Set(rawAlarms.map(a => a['CCURE Incident Priority']))),
    [rawAlarms]
  );

  // 2) base filtered set
  const filtered = useMemo(() => (
    rawAlarms.filter(a => {
      if (filters.region   && a.Region   !== filters.region)   return false;
      if (filters.location && a.Location !== filters.location) return false;
      if (filters.month    && formatMonthYear(a.Date) !== filters.month) return false;
      if (filters.priority && a['CCURE Incident Priority'] !== filters.priority) return false;
      return true;
    })
  ), [rawAlarms, filters]);

  // 3) build filteredSummary for cards/charts
  const filteredSummary = useMemo(() => {
    if (!summary) return null;
    const fs = { ...summary };

    // regionWise/locationWise
    if (filters.region) {
      fs.regionWise   = { [filters.region]: summary.regionWise[filters.region] };
      fs.locationWise = {};
      locationOptions
        .filter(l => !filters.location || l === filters.location)
        .forEach(l => {
          fs.locationWise[l] = summary.locationWise[l];
        });
    }

    // monthWise
    if (filters.month) {
      const mCount = filtered.filter(a => formatMonthYear(a.Date) === filters.month).length;
      fs.monthWise = { [filters.month]: { count: mCount } };
    } else {
      fs.monthWise = {};
    }

    // operatorWise
    const opCounts = filtered.reduce((acc, a) => {
      const op = a['Name of Person Attending Alarms (First, Last Name)'] || 'Unknown';
      acc[op] = (acc[op] || 0) + 1;
      return acc;
    }, {});
    fs.operatorWise = Object.fromEntries(
      Object.entries(opCounts).map(([k, v]) => [k, { count: v }])
    );

    return fs;
  }, [summary, filtered, filters, locationOptions]);

  if (!summary) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <Box component="header" sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '3px solid #1976d2', bgcolor: '#e3f2fd', p: 2
      }}>
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
        <Filters
          filters={filters} setFilters={setFilters}
          regionOptions={regionOptions}
          locationOptions={locationOptions}
          monthOptions={monthOptions}
          priorityOptions={priorityOptions}
        />

        {/* top cards */}
        <AlarmCard
          summary={filteredSummary}
          rawAlarms={filtered}
          filters={filters}
        />

        {/* all charts */}
        <SummaryCards
          summary={filteredSummary}
          filters={filters}
          rawAlarms={filtered}
        />
      </Container>
    </Box>
  );
}














raed below dashboard.js file carefully & make a required changes in this file and Give me updated js file carefuly.
  dont make another changes in this file.

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Typography, Container } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Filters from '../components/Filters';
import AlarmCard from '../components/AlarmCard';
import SummaryCards from '../components/SummaryCards';
import { getAlarmSummary, getRawAlarms } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [rawAlarms, setRawAlarms] = useState([]);
  const [filters, setFilters] = useState({
    region: '', location: '', month: '', priority: ''
  });

  useEffect(() => {
    Promise.all([getAlarmSummary(), getRawAlarms()])
      .then(([sumRes, rawRes]) => {
        setSummary(sumRes.data);
        setRawAlarms(rawRes.data);
      })
      .catch(console.error);
  }, []);

  // --- derive month from Date string ---
  const getMonth = dateStr =>
    new Date(dateStr).toLocaleString('en-US', { month: 'short' });

  // 1) options
  const regionOptions = useMemo(
    () => summary ? Object.keys(summary.regionWise) : [], [summary]
  );
  const locationOptions = useMemo(
    () => filters.region
      ? Array.from(new Set(
          rawAlarms.filter(a => a.Region === filters.region).map(a => a.Location)
        ))
      : [], [rawAlarms, filters.region]
  );
  const monthOptions = useMemo(() => (
    Array.from(new Set(
      rawAlarms
        .filter(a =>
          (!filters.region   || a.Region   === filters.region) &&
          (!filters.location || a.Location === filters.location)
        )
        .map(a => getMonth(a.Date))
    ))
    .sort((a, b) => a.localeCompare(b))
  ), [rawAlarms, filters.region, filters.location]);

  const priorityOptions = useMemo(
    () => Array.from(new Set(rawAlarms.map(a => a['CCURE Incident Priority']))),
    [rawAlarms]
  );

  // 2) filtered base for cards & charts
  const filtered = useMemo(() => {
    return rawAlarms.filter(a => {
      if (filters.region   && a.Region   !== filters.region)   return false;
      if (filters.location && a.Location !== filters.location) return false;
      if (filters.month    && getMonth(a.Date) !== filters.month) return false;
      if (filters.priority && a['CCURE Incident Priority'] !== filters.priority) return false;
      return true;
    });
  }, [rawAlarms, filters]);

  // 3) summary slice for cards/charts
  const filteredSummary = useMemo(() => {
    if (!summary) return null;
    const fs = { ...summary };

    // regionWise & locationWise
    if (filters.region) {
      fs.regionWise = { [filters.region]: summary.regionWise[filters.region] };
      fs.locationWise = {};
      locationOptions
        .filter(l => !filters.location || l === filters.location)
        .forEach(l => {
          fs.locationWise[l] = summary.locationWise[l];
        });
    }

    // monthWise
    if (filters.month) {
      const mCount = filtered.filter(a => getMonth(a.Date) === filters.month).length;
      fs.monthWise = { [filters.month]: { count: mCount } };
    } else {
      fs.monthWise = {};
    }

    // operatorWise
    const opCounts = filtered.reduce((c, a) => {
      const op = a['Name of Person Attending Alarms (First, Last Name)'] || 'Unknown';
      c[op] = (c[op] || 0) + 1;
      return c;
    }, {});
    fs.operatorWise = Object.fromEntries(
      Object.entries(opCounts).map(([k, v]) => [k, { count: v }])
    );

    return fs;
  }, [summary, filtered, filters, locationOptions]);

  if (!summary) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <Box component="header" sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '3px solid #1976d2', bgcolor: '#e3f2fd', p: 2
      }}>
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
        <Filters
          filters={filters}
          setFilters={setFilters}
          regionOptions={regionOptions}
          locationOptions={locationOptions}
          monthOptions={monthOptions}
          priorityOptions={priorityOptions}
        />

        {/* cards (top row) */}
        <AlarmCard
          summary={filteredSummary}
          rawAlarms={filtered}
          filters={filters}
        />

        {/* charts */}
        <SummaryCards
          summary={filteredSummary}
          filters={filters}
          rawAlarms={filtered}
        />
      </Container>
    </Box>
  );
}

