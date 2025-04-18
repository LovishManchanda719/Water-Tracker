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
import { DEFAULT_CALCIUM_GOAL, getLast7DaysData } from '../utils';

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

const MilkChart: React.FC = () => {
  const { state } = useWaterTracker();
  const last7DaysData = getLast7DaysData(state);
  
  // Get the current calcium goal from state
  const currentCalciumGoal = state.calciumGoal || DEFAULT_CALCIUM_GOAL;
  
  // Prepare chart data
  const labels = last7DaysData.map(day => format(parseISO(day.date), 'EEE'));
  
  // Make sure we have valid calcium goals
  const calciumData = last7DaysData.map(day => ({
    ...day,
    // Use the current goal for all days to show a consistent goal line
    calciumGoal: currentCalciumGoal,
    totalCalciumAmount: day.totalCalciumAmount || 0
  }));
  
  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Calcium from Milk (mg)',
        data: calciumData.map(day => day.totalCalciumAmount),
        backgroundColor: 'rgba(229, 112, 126, 0.7)',
        borderColor: 'rgba(229, 112, 126, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Daily Calcium Goal',
        data: calciumData.map(day => day.calciumGoal),
        backgroundColor: 'rgba(210, 95, 45, 0.2)',
        borderColor: 'rgba(210, 95, 45, 1)',
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
          text: 'Calcium (mg)'
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
        text: 'Calcium Intake - Last 7 Days',
      },
    },
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Calcium History</h2>
      <div style={{ height: '300px' }}>
        <Chart type='bar' data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MilkChart; 