import React from 'react';
import './SummaryCards.css'; // Optional styling
import { Pie, Bar } from 'react-chartjs-2';

const SummaryCards = ({ summary }) => {
  const { totalAlarms, responseSentPercentage, regionWise, priorityWise, rejectionTypeWise, operatorWise } = summary;

  const regionChart = {
    labels: Object.keys(regionWise),
    datasets: [{
      data: Object.values(regionWise).map(r => r.count),
      backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545']
    }]
  };

  const priorityChart = {
    labels: Object.keys(priorityWise),
    datasets: [{
      data: Object.values(priorityWise).map(p => p.count),
      backgroundColor: ['#6c757d', '#17a2b8', '#fd7e14']
    }]
  };

  const operatorChart = {
    labels: Object.keys(operatorWise),
    datasets: [{
      label: 'Alarm Count',
      data: Object.values(operatorWise).map(o => o.count),
      backgroundColor: '#007bff'
    }]
  };

  return (
    <div className="summary-container">
      <h2>Alarm Summary</h2>
      <div className="cards">
        <div className="card">Total Alarms: <strong>{totalAlarms}</strong></div>
        <div className="card">Response Sent: <strong>{responseSentPercentage}</strong></div>
      </div>

      <div className="charts">
        <div className="chart">
          <h4>Region Wise</h4>
          <Pie data={regionChart} />
        </div>
        <div className="chart">
          <h4>Priority Wise</h4>
          <Pie data={priorityChart} />
        </div>
        <div className="chart">
          <h4>Operator Wise</h4>
          <Bar data={operatorChart} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
