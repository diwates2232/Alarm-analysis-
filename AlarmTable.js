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
