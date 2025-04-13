import React, { useEffect, useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import { getAlarmSummary } from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getAlarmSummary()
      .then(res => setSummary(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!summary) return <div>Loading Summary...</div>;

  return (
    <div>
      <SummaryCards summary={summary} />
    </div>
  );
};

export default Dashboard;
