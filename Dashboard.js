Read below dashboard.js file and help to solve 

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

  useEffect(() => {
    Promise.all([getAlarmSummary(), getRawAlarms()])
      .then(([sumRes, rawRes]) => {
        setSummary(sumRes.data);
        setRawAlarms(rawRes.data);
      })
      .catch(console.error);
  }, []);

  const regionOptions = useMemo(
    () => (summary ? Object.keys(summary.regionWise) : []),
    [summary]
  );

  const regionLocationsMap = useMemo(() => {
    const map = {};
    regionOptions.forEach(region => {
      map[region] = Array.from(
        new Set(rawAlarms.filter(a => a.Region === region).map(a => a.Location))
      );
    });
    return map;
  }, [rawAlarms, regionOptions]);

  const slidesRef = useRef([]);
  const slideIdx  = useRef(0);
  useEffect(() => {
    if (!summary) return;
    const slides = [{ region: '', location: '' }];
    regionOptions.forEach(region => slides.push({ region, location: '' }));
    slidesRef.current = slides;
    slideIdx.current   = 0;
    setFilters(slides[0]);
    const id = setInterval(() => {
      slideIdx.current = (slideIdx.current + 1) % slidesRef.current.length;
      setFilters(slidesRef.current[slideIdx.current]);
    }, 30000);
    return () => clearInterval(id);
  }, [summary, regionOptions]);

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
          {/* Hidden dummy fields to absorb autofill */}
          <input
            type="text"
            name="username"
            style={{ display: 'none' }}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            style={{ display: 'none' }}
            autoComplete="new-password"
          />

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
        </form>

        <SummaryCards
          summary={filteredSummary}
          filters={filters}
          rawAlarms={rawAlarms}
        />
      </Container>
    </Box>
  );
}


