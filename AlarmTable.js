// src/components/AlarmsTable.js
import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography } from '@mui/material';
import * as XLSX from 'xlsx';

const AlarmsTable = ({ alarms = [], maxRows = 10 }) => {
  // Excel export
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(alarms);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alarms');
    XLSX.writeFile(wb, 'alarms.xlsx');
  };

  // 1) Aggregate per-employee stats
  const employeeStats = useMemo(() => {
    const stats = {};
    alarms.forEach(a => {
      const emp = a['Employee Name'] || 'Unknown';
      const dt = a.Date + ' ' + a['Time of  Alarm (Local time)'];
      if (!stats[emp]) {
        stats[emp] = {
          total: 0,
          types: new Set(),
          doorRej: {},
          lastDt: dt,
          lastRegion: a.Region,
          lastLocation: a.Location,
        };
      }
      const e = stats[emp];
      e.total += 1;
      e.types.add(a.Rejection);
      const drKey = `${a.Door}::${a.Rejection}`;
      e.doorRej[drKey] = (e.doorRej[drKey] || 0) + 1;
      if (dt > e.lastDt) {
        e.lastDt = dt;
        e.lastRegion = a.Region;
        e.lastLocation = a.Location;
      }
    });

    return Object.entries(stats).map(([emp, s], idx) => {
      const repeats = Object.entries(s.doorRej).filter(([, cnt]) => cnt > 1);
      let topDoor = '', topCount = 0;
      if (repeats.length) {
        const [key, cnt] = repeats.reduce((a, b) => a[1] > b[1] ? a : b);
        [topDoor] = key.split('::');
        topCount = cnt;
      }
      const [lastDate, lastTime] = s.lastDt.split(' ');
      return {
        id: idx,
        employee: emp,
        lastDate,
        lastTime,
        total: s.total,
        repeatedDoor: topDoor,
        repeatCount: topCount,
        rejectionTypes: Array.from(s.types).join(', '),
        location: s.lastLocation,
        region: s.lastRegion,
      };
    });
  }, [alarms]);

  // 2) Door Analysis
  const doorStats = useMemo(() => {
    const d = {};
    alarms.forEach(a => {
      const door = a.Door || 'Unknown';
      if (!d[door]) d[door] = { total: 0, rejections: {} };
      d[door].total += 1;
      d[door].rejections[a.Rejection] = (d[door].rejections[a.Rejection] || 0) + 1;
    });
    return Object.entries(d)
      .filter(([, s]) => s.total > 1)
      .map(([door, s], idx) => ({
        id: idx,
        door,
        total: s.total,
        rejectionCounts: Object.entries(s.rejections)
          .map(([type, c]) => `${type}:${c}`)
          .join(', ')
      }));
  }, [alarms]);

  // 3) Detailed raw rows
  const rawRows = useMemo(() => alarms.map((a, i) => ({ id: i, ...a })), [alarms]);

  if (!alarms.length) {
    return (
      <Typography variant="h6" align="center" style={{ marginTop: 40 }}>
        No alarm records to display.
      </Typography>
    );
  }

  // Columns
  const empColumns = [
    { field: 'employee', headerName: 'Employee', width: 180 },
    { field: 'lastDate', headerName: 'Last Date', width: 120 },
    { field: 'lastTime', headerName: 'Last Time', width: 120 },
    { field: 'total', headerName: 'Total Alarms', width: 130 },
    { field: 'repeatedDoor', headerName: 'Repeated Door', width: 200 },
    { field: 'repeatCount', headerName: 'Repeat Count', width: 130 },
    { field: 'rejectionTypes', headerName: 'Types of Rejection', width: 300 },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'region', headerName: 'Region', width: 120 },
  ];

  const doorColumns = [
    { field: 'door', headerName: 'Door', width: 300 },
    { field: 'total', headerName: 'Total Alarms', width: 150 },
    { field: 'rejectionCounts', headerName: 'Rejection Counts', width: 400 }
  ];

  const rawColumns = [
    { field: 'Sr. No', headerName: 'Sr. No', width: 90 },
    { field: 'Date', headerName: 'Date', width: 120 },
    { field: 'Time of  Alarm (Local time)', headerName: 'Time', width: 150 },
    { field: 'Type of Alarm', headerName: 'Type', width: 150 },
    { field: 'Door', headerName: 'Door', width: 250 },
    { field: 'Location', headerName: 'Location', width: 150 },
    { field: 'Region', headerName: 'Region', width: 120 },
    { field: 'Rejection', headerName: 'Rejection', width: 180 },
    { field: 'CCURE Incident Priority', headerName: 'Priority', width: 150 },
    {
      field: 'Name of Person Attending Alarms (First, Last Name)',
      headerName: 'Operator',
      width: 200
    },
    { field: 'Action Taken', headerName: 'Action Taken', width: 150 },
    { field: ' Time Taken (Min)', headerName: 'Time Taken (Min)', width: 150 }
  ];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Employee Analysis */}
      <Typography variant="h5" gutterBottom>
        Employee Analysis
      </Typography>
      <div style={{ height: '30%', marginBottom: 24 }}>
        <DataGrid
          rows={employeeStats}
          columns={empColumns}
          pageSize={maxRows}
          rowsPerPageOptions={[maxRows]}
          autoHeight={false}
        />
      </div>

      {/* Door Analysis */}
      <Typography variant="h5" gutterBottom>
        Door Analysis
      </Typography>
      <div style={{ height: '20%', marginBottom: 24 }}>
        <DataGrid
          rows={doorStats}
          columns={doorColumns}
          pageSize={Math.min(5, maxRows)}
          rowsPerPageOptions={[Math.min(5, maxRows)]}
          autoHeight={false}
        />
      </div>

      {/* Detailed Alarm Records */}
      <Typography variant="h5" gutterBottom>
        Detailed Alarm Records
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={exportToExcel}
        style={{ marginBottom: 16 }}
      >
        Export to Excel
      </Button>
      <div style={{ height: '40%' }}>
        <DataGrid
          rows={rawRows}
          columns={rawColumns}
          getRowClassName={params =>
            params.row[' Time Taken (Min)'] > 0 ? 'sla-breach' : ''
          }
          pageSize={maxRows}
          rowsPerPageOptions={[10, 20, 50].filter(x => x <= rawRows.length)}
          autoHeight={false}
        />
      </div>
    </div>
  );
};

export default AlarmsTable;












read below Alarmstable.js and chech popr maxRows are allow or not.



// src/components/AlarmsTable.js
import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography } from '@mui/material';
import * as XLSX from 'xlsx';

const AlarmsTable = ({ alarms = [] }) => {
  // Excel export
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(alarms);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alarms');
    XLSX.writeFile(wb, 'alarms.xlsx');
  };

  // 1) Aggregate per-employee stats
  const employeeStats = useMemo(() => {
    const stats = {};
    alarms.forEach(a => {
      const emp = a['Employee Name'] || 'Unknown';
      const dt = a.Date + ' ' + a['Time of  Alarm (Local time)'];
      if (!stats[emp]) {
        stats[emp] = {
          total: 0,
          types: new Set(),
          doorRej: {},    // key=door::rej, value=count
          lastDt: dt,
          lastRegion: a.Region,
          lastLocation: a.Location,
        };
      }
      const e = stats[emp];
      e.total += 1;
      e.types.add(a.Rejection);
      const drKey = `${a.Door}::${a.Rejection}`;
      e.doorRej[drKey] = (e.doorRej[drKey] || 0) + 1;
      // track latest
      if (dt > e.lastDt) {
        e.lastDt = dt;
        e.lastRegion = a.Region;
        e.lastLocation = a.Location;
      }
    });

    // Build rows
    return Object.entries(stats).map(([emp, s], idx) => {
      // find door+rej with max repeats
      const repeats = Object.entries(s.doorRej)
        .filter(([,cnt]) => cnt > 1);
      let topDoor = '', topCount = 0;
      if (repeats.length) {
        const [key, cnt] = repeats.reduce((a, b) => a[1] > b[1] ? a : b);
        [topDoor] = key.split('::');
        topCount = cnt;
      }
      const [lastDate, lastTime] = s.lastDt.split(' ');
      return {
        id: idx,
        employee: emp,
        lastDate,
        lastTime,
        total: s.total,
        repeatedDoor: topDoor,
        repeatCount: topCount,
        rejectionTypes: Array.from(s.types).join(', '),
        location: s.lastLocation,
        region: s.lastRegion,
      };
    });
  }, [alarms]);

  // 2) Door Analysis unchanged
  const doorStats = useMemo(() => {
    const d = {};
    alarms.forEach(a => {
      const door = a.Door || 'Unknown';
      if (!d[door]) d[door] = { total: 0, rejections: {} };
      d[door].total += 1;
      d[door].rejections[a.Rejection] = (d[door].rejections[a.Rejection]||0) + 1;
    });
    return Object.entries(d)
      .filter(([, s]) => s.total > 1)
      .map(([door, s], idx) => ({
        id: idx,
        door,
        total: s.total,
        rejectionCounts: Object.entries(s.rejections)
          .map(([type,c]) => `${type}:${c}`)
          .join(', ')
      }));
  }, [alarms]);

  // 3) Detailed raw rows
  const rawRows = useMemo(() => alarms.map((a,i) => ({ id: i, ...a })), [alarms]);

  if (!alarms.length) {
    return (
      <Typography variant="h6" align="center" style={{ marginTop: 40 }}>
        No alarm records to display.
      </Typography>
    );
  }

  // Columns
  const empColumns = [
    { field: 'employee', headerName: 'Employee', width: 180 },
    { field: 'lastDate', headerName: 'Last Date', width: 120 },
    { field: 'lastTime', headerName: 'Last Time', width: 120 },
    { field: 'total', headerName: 'Total Alarms', width: 130 },
    { field: 'repeatedDoor', headerName: 'Repeated Door', width: 200 },
    { field: 'repeatCount', headerName: 'Repeat Count', width: 130 },
    { field: 'rejectionTypes', headerName: 'Types of Rejection', width: 300 },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'region', headerName: 'Region', width: 120 },
  ];

  const doorColumns = [
    { field: 'door', headerName: 'Door', width: 300 },
    { field: 'total', headerName: 'Total Alarms', width: 150 },
    { field: 'rejectionCounts', headerName: 'Rejection Counts', width: 400 }
  ];

  const rawColumns = [
    { field: 'Sr. No', headerName: 'Sr. No', width: 90 },
    { field: 'Date', headerName: 'Date', width: 120 },
    
    { field: 'Time of  Alarm (Local time)', headerName: 'Time', width: 150 },
    { field: 'Type of Alarm', headerName: 'Type', width: 150 },
    { field: 'Door', headerName: 'Door', width: 250 },
    { field: 'Location', headerName: 'Location', width: 150 },
    { field: 'Region', headerName: 'Region', width: 120 },
    { field: 'Rejection', headerName: 'Rejection', width: 180 },
    { field: 'CCURE Incident Priority', headerName: 'Priority', width: 150 },
    {
      field: 'Name of Person Attending Alarms (First, Last Name)',
      headerName: 'Operator',
      width: 200
    },
    { field: 'Action Taken', headerName: 'Action Taken', width: 150 },
    { field: ' Time Taken (Min)', headerName: 'Time Taken (Min)', width: 150 }
  ];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Employee Analysis */}
      <Typography variant="h5" gutterBottom>
        Employee Analysis
      </Typography>
      <div style={{ height: '30%', marginBottom: 24 }}>
        <DataGrid
          rows={employeeStats}
          columns={empColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight={false}
        />
      </div>

      {/* Door Analysis */}
      <Typography variant="h5" gutterBottom>
        Door Analysis
      </Typography>
      <div style={{ height: '20%', marginBottom: 24 }}>
        <DataGrid
          rows={doorStats}
          columns={doorColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight={false}
        />
      </div>

      {/* Detailed Records */}
      <Typography variant="h5" gutterBottom>
        Detailed Alarm Records
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={exportToExcel}
        style={{ marginBottom: 16 }}
      >
        Export to Excel
      </Button>
      <div style={{ height: '40%' }}>
        <DataGrid
          rows={rawRows}
          columns={rawColumns}
          getRowClassName={params =>
            params.row[' Time Taken (Min)'] > 0 ? 'sla-breach' : ''
          }
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          autoHeight={false}
        />
      </div>
    </div>
  );
};

export default AlarmsTable;

