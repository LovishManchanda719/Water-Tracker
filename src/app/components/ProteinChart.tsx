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
import { DEFAULT_PROTEIN_GOAL, getLast7DaysData } from '../utils';

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

const ProteinChart: React.FC = () => {
  const { state } = useWaterTracker();
  const last7DaysData = getLast7DaysData(state);
  
  // Get the current protein goal from state
  const currentProteinGoal = state.proteinGoal || DEFAULT_PROTEIN_GOAL;
  
  // Prepare chart data
  const labels = last7DaysData.map(day => format(parseISO(day.date), 'EEE'));
  
  // Make sure we have valid protein data
  const proteinData = last7DaysData.map(day => ({
    ...day,
    // Use the current goal for all days to show a consistent goal line
    proteinGoal: currentProteinGoal,
    totalProteinAmount: day.totalProteinAmount || 0
  }));
  
  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Protein Intake (g)',
        data: proteinData.map(day => day.totalProteinAmount),
        backgroundColor: 'rgba(52, 168, 83, 0.7)',
        borderColor: 'rgba(52, 168, 83, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Daily Protein Goal',
        data: proteinData.map(day => day.proteinGoal),
        backgroundColor: 'rgba(52, 120, 83, 0.2)',
        borderColor: 'rgba(52, 120, 83, 1)',
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
          text: 'Protein (g)'
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
        text: 'Protein Intake - Last 7 Days',
      },
    },
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Protein History</h2>
      <div style={{ height: '300px' }}>
        <Chart type='bar' data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProteinChart; 