import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';

const AlarmsTable = ({ alarms }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(alarms);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alarms');
    XLSX.writeFile(workbook, 'alarms.xlsx');
  };

  const columns = [
    { field: 'Sr. No', headerName: 'Sr. No', width: 90 },
    { field: 'Date', headerName: 'Date', width: 120 },
    { field: 'Time of Alarm (Local time)', headerName: 'Time', width: 150 },
    { field: 'Region', headerName: 'Region', width: 120 },
    { field: 'Rejection', headerName: 'Rejection', width: 150 },
    { field: 'CCURE Incident Priority', headerName: 'Priority', width: 150 },
    { field: 'Name of Person Attending Alarms (First, Last Name)', headerName: 'Operator', width: 200 },
    { field: 'Action Taken', headerName: 'Action Taken', width: 150 },
    { field: 'Time Taken (Min)', headerName: 'Time Taken (Min)', width: 150 },
    // Add other necessary fields
  ];

  const rows = alarms.map((alarm, index) => ({
    id: index,
    ...alarm,
  }));

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Button variant="contained" color="primary" onClick={exportToExcel}>
        Export to Excel
      </Button>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={(params) =>
          params.row['Time Taken (Min)'] > 0 ? 'sla-breach' : ''
        }
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
};

export default AlarmsTable;











import React from 'react';

const AlarmsTable = ({ data }) => {
  return (
    <div>
      <h3>Raw Alarm Logs</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Region</th>
            <th>Rejection</th>
            <th>Priority</th>
            <th>Operator</th>
            <th>Action Taken</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          {data.map((alarm, index) => (
            <tr key={index}>
              <td>{alarm.Date}</td>
              <td>{alarm["Time of  Alarm (Local time)"]}</td>
              <td>{alarm.Location}</td>
              <td>{alarm.Region}</td>
              <td>{alarm.Rejection}</td>
              <td>{alarm["CCURE Incident Priority"]}</td>
              <td>{alarm["Name of Person Attending Alarms (First, Last Name)"]}</td>
              <td>{alarm["Action Taken"]}</td>
              <td>{alarm["Target SLA in Mins"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlarmsTable;
