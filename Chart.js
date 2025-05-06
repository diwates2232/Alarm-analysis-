read my previous chart.js file carefully & Add above Functions in this file .dont change another
functions in this file.

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// stronger, fixed palette
const defaultColors = [
  '#3366CC', '#DC3912', '#FF9900', '#109618',
  '#990099', '#0099C6', '#DD4477', '#66AA00',
  '#B82E2E', '#316395'
];

export default function MyChart({
  type = 'bar',
  data,
  options = {},
  width = '100%',
  height = '100%'
}) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();

    const bg = data.bgColors || defaultColors.slice(0, data.values.length);
    const border = data.borderColor || bg;

    const chartData = {
      labels: data.labels,
      datasets: [{
        label: data.label || '',
        data: data.values,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 2,
        ...(type === 'line' && {
          tension: 0.3,
          pointRadius: 6
        })
      }],
    };

    chartRef.current = new Chart(ctx, {
      type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: { labels: { font: { size: 14 } } }
        },
        scales: {
          x: { beginAtZero: true, ...(options.scales?.x || {}) },
          y: { beginAtZero: true, ...(options.scales?.y || {}) }
        },
        ...options
      },
    });

    return () => chartRef.current?.destroy();
  }, [type, data, options]);

  return (
    <div style={{ width, height, border: '1px solid #ccc', borderRadius: 4, padding: 8 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

