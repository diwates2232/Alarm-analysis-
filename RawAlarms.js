import React, { useEffect, useState } from 'react';
import AlarmsTable from '../components/AlarmsTable';
import { getRawAlarms } from '../services/api';

const RawAlarms = () => {
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    getRawAlarms()
      .then(res => setAlarms(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <AlarmsTable data={alarms} />
    </div>
  );
};

export default RawAlarms;
