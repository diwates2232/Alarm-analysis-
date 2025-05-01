import React from 'react';
import {
  TextField,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function Filters({
  filters,
  setFilters,
  regionOptions = [],
  locationOptions = [],
  monthOptions = []
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
    </Grid>
  );
}







Read below Alarmcard.js File And Give me updated js file carefully.also Dont make another chamges.
import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, MenuItem } from '@mui/material';

export default function AlarmCard({ summary, rawAlarms, filters, setFilters }) {
  if (!summary) return null;

  // Filtered alarms for month dropdown and counts
  const baseFiltered = rawAlarms.filter(a => {
    if (filters.region && a.Region !== filters.region) return false;
    if (filters.location && a.Location !== filters.location) return false;
    return true;
  });

  const monthOptions = Array.from(
    new Set(baseFiltered.map(a => a.Month))
  ).sort();

  const monthFiltered = filters.month
    ? baseFiltered.filter(a => a.Month === filters.month)
    : baseFiltered;

  const totalAlarms = monthFiltered.length;

  const sentCount = monthFiltered.filter(a =>
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

      {/* Month Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <TextField
              id="month-select"
              label="Month"
              select
              fullWidth
              value={filters.month || ''}
              onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
              variant="outlined"
              autoComplete="off"
              InputLabelProps={{ htmlFor: 'month-select' }}
              inputProps={{ autoComplete: 'new-password' }}
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




