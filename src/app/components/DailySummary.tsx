'use client';

import React from 'react';
import { format } from 'date-fns';
import { useWaterTracker } from '../context/WaterContext';
import { calculateProgress, getToday } from '../utils';

const DailySummary: React.FC = () => {
  const { state } = useWaterTracker();
  const today = getToday();
  const dailyData = state.waterData[today] || { totalAmount: 0, goal: state.dailyGoal };
  
  const progress = calculateProgress(dailyData.totalAmount, dailyData.goal);
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-2">Today: {formattedDate}</h2>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">Daily Goal: {dailyData.goal}ml</span>
        <span className="text-sm font-medium">
          {dailyData.totalAmount}ml / {dailyData.goal}ml
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className={`h-4 rounded-full ${progress >= 100 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">{progress}%</span>
          <span className="text-sm ml-1">completed</span>
        </div>
        <div className="text-sm">
          {dailyData.entries.length} bottle{dailyData.entries.length !== 1 ? 's' : ''} today
        </div>
      </div>
    </div>
  );
};

export default DailySummary; 