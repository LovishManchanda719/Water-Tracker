'use client';

import React from 'react';
import { format } from 'date-fns';
import { useWaterTracker } from '../context/WaterContext';
import { DEFAULT_CALCIUM_GOAL, DEFAULT_MILK_GOAL, DEFAULT_WATER_GOAL, DEFAULT_CURD_GOAL, DEFAULT_PROTEIN_GOAL, calculateProgress, getToday } from '../utils';
import { DrinkType } from '../types';

const DailySummary: React.FC = () => {
  const { state } = useWaterTracker();
  const today = getToday();
  
  // Create daily data with fallbacks to default values
  const dailyData = state.data[today] || { 
    totalWaterAmount: 0, 
    totalMilkAmount: 0,
    totalCurdAmount: 0,
    totalCalciumAmount: 0,
    totalProteinAmount: 0,
    waterGoal: state.waterGoal || DEFAULT_WATER_GOAL,
    milkGoal: state.milkGoal || DEFAULT_MILK_GOAL,
    curdGoal: state.curdGoal || DEFAULT_CURD_GOAL,
    calciumGoal: state.calciumGoal || DEFAULT_CALCIUM_GOAL,
    proteinGoal: state.proteinGoal || DEFAULT_PROTEIN_GOAL,
    entries: []
  };
  
  // Ensure we have valid goals (in case they're 0 in the data)
  const waterGoal = dailyData.waterGoal || DEFAULT_WATER_GOAL;
  const milkGoal = dailyData.milkGoal || DEFAULT_MILK_GOAL;
  const curdGoal = dailyData.curdGoal || DEFAULT_CURD_GOAL;
  const calciumGoal = dailyData.calciumGoal || DEFAULT_CALCIUM_GOAL;
  const proteinGoal = dailyData.proteinGoal || DEFAULT_PROTEIN_GOAL;
  
  const waterProgress = calculateProgress(dailyData.totalWaterAmount, waterGoal);
  const milkProgress = calculateProgress(dailyData.totalMilkAmount, milkGoal);
  const curdProgress = calculateProgress(dailyData.totalCurdAmount, curdGoal);
  const calciumProgress = calculateProgress(dailyData.totalCalciumAmount, calciumGoal);
  const proteinProgress = calculateProgress(dailyData.totalProteinAmount, proteinGoal);
  
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  // Count entries by type
  const waterEntries = dailyData.entries?.filter(entry => entry.type === DrinkType.WATER) || [];
  const milkEntries = dailyData.entries?.filter(entry => entry.type === DrinkType.MILK) || [];
  const curdEntries = dailyData.entries?.filter(entry => entry.type === DrinkType.CURD) || [];
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Today: {formattedDate}</h2>
      
      {/* Water tracking */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Water Intake</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Goal: {waterGoal}ml</span>
          <span className="text-sm font-medium">
            {dailyData.totalWaterAmount}ml / {waterGoal}ml
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className={`h-3 rounded-full ${waterProgress >= 100 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`} 
            style={{ width: `${waterProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-bold">{waterProgress}%</span>
            <span className="ml-1">completed</span>
          </div>
          <div>
            {waterEntries.length} drink{waterEntries.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {/* Milk tracking
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Milk Intake</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Goal: {milkGoal}ml</span>
          <span className="text-sm font-medium">
            {dailyData.totalMilkAmount}ml / {milkGoal}ml
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className="h-3 rounded-full bg-amber-500" 
            style={{ width: `${milkProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-bold">{milkProgress}%</span>
            <span className="ml-1">completed</span>
          </div>
          <div>
            {milkEntries.length} glass{milkEntries.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div> */}
      
      {/* Curd tracking
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Curd Intake</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Goal: {curdGoal}g</span>
          <span className="text-sm font-medium">
            {dailyData.totalCurdAmount}g / {curdGoal}g
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className="h-3 rounded-full bg-amber-900" 
            style={{ width: `${curdProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-bold">{curdProgress}%</span>
            <span className="ml-1">completed</span>
          </div>
          <div>
            {curdEntries.length} bowl{curdEntries.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div> */}
      
      {/* Calcium tracking */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Calcium Intake</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Goal: {calciumGoal}mg</span>
          <span className="text-sm font-medium">
            {Math.round(dailyData.totalCalciumAmount)}mg / {calciumGoal}mg
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className="h-3 rounded-full bg-red-400"
            style={{ width: `${calciumProgress}%` }}
          />
        </div>
        
        <div className="text-sm">
          <span className="font-bold">{calciumProgress}%</span>
          <span className="ml-1">of daily calcium goal</span>
        </div>
      </div>
      
      {/* Protein tracking */}
      <div>
        <h3 className="text-lg font-medium mb-2">Protein Intake</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Goal: {proteinGoal}g</span>
          <span className="text-sm font-medium">
            {Math.round(dailyData.totalProteinAmount)}g / {proteinGoal}g
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className="h-3 rounded-full bg-green-500"
            style={{ width: `${proteinProgress}%` }}
          />
        </div>
        
        <div className="text-sm">
          <span className="font-bold">{proteinProgress}%</span>
          <span className="ml-1">of daily protein goal</span>
        </div>
      </div>
    </div>
  );
};

export default DailySummary; 