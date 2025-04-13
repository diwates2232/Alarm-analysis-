import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MyChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Define chart configuration
    const config = {
      type: 'bar', // Change to 'doughnut', 'line', etc. as needed
      data: {
        labels: data.labels,
        datasets: [{
          label: 'My Dataset',
          data: data.values,
          backgroundColor: [
            '#8884d8',
            '#82ca9d',
            '#ffc658',
            '#ff7f50',
            '#a29bfe',
          ],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    // Create new chart instance
    chartInstance.current = new Chart(ctx, config);
  }, [data]);

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MyChart;










import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Charts = ({ data }) => {
  const chartData = Object.entries(data.monthWise).map(([month, values]) => ({
    month,
    count: values.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Charts;
