














import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { DateRangePicker } from '@mui/lab';

const Filters = ({ filters, setFilters }) => {
  const handleChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <TextField
        select
        label="Region"
        value={filters.region}
        onChange={handleChange('region')}
      >
        {/* Map through regions */}
        <MenuItem value="">All</MenuItem>
        <MenuItem value="EMEA">EMEA</MenuItem>
        <MenuItem value="APAC">APAC</MenuItem>
        {/* Add other regions */}
      </TextField>

      <TextField
        select
        label="Operator"
        value={filters.operator}
        onChange={handleChange('operator')}
      >
        {/* Map through operators */}
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Manisha Choudhari">Manisha Choudhari</MenuItem>
        <MenuItem value="Swapnil Diwate">Swapnil Diwate</MenuItem>
        {/* Add other operators */}
      </TextField>

      <DateRangePicker
        startText="Start Date"
        endText="End Date"
        value={filters.dateRange}
        onChange={(newValue) => {
          setFilters({ ...filters, dateRange: newValue });
        }}
        renderInput={(startProps, endProps) => (
          <>
            <TextField {...startProps} />
            <TextField {...endProps} />
          </>
        )}
      />
    </div>
  );
};

export default Filters;
