'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  BarController,
  LineController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useWaterTracker } from '../context/WaterContext';
import { getLast7DaysData } from '../utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

const WaterChart: React.FC = () => {
  const { state } = useWaterTracker();
  const last7DaysData = getLast7DaysData(state);
  
  // Prepare chart data
  const labels = last7DaysData.map(day => format(parseISO(day.date), 'EEE'));
  
  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Water Intake (ml)',
        data: last7DaysData.map(day => day.totalAmount),
        backgroundColor: 'rgba(26, 115, 232, 0.7)',
        borderColor: 'rgba(26, 115, 232, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Daily Goal',
        data: last7DaysData.map(day => day.goal),
        backgroundColor: 'rgba(52, 168, 83, 0.2)',
        borderColor: 'rgba(52, 168, 83, 1)',
        borderWidth: 1,
        fill: false,
      }
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume (ml)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Day'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Water Intake - Last 7 Days',
      },
    },
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Hydration History</h2>
      <div style={{ height: '300px' }}>
        <Chart type='bar' data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WaterChart; 