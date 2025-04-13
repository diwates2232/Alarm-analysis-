import React from 'react';

const AlarmCard = () => {
  // You can replace this with dynamic alarm data later
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h2>Alarm Summary</h2>
      <p>Critical Alarms: 5</p>
      <p>Major Alarms: 12</p>
      <p>Minor Alarms: 8</p>
    </div>
  );
};

export default AlarmCard;
