'use client';

import React, { useState } from 'react';
import { useWaterTracker } from '../context/WaterContext';

const Settings: React.FC = () => {
  const { state, bottleSize, setDailyGoal, setBottleSize } = useWaterTracker();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<number>(state.dailyGoal);
  const [bottleSizeInput, setBottleSizeInput] = useState<number>(bottleSize);
  
  const handleSave = () => {
    if (goalInput > 0) {
      setDailyGoal(goalInput);
    }
    
    if (bottleSizeInput > 0) {
      setBottleSize(bottleSizeInput);
    }
    
    setIsOpen(false);
  };
  
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <button 
          className="text-sm text-[var(--primary)] font-medium"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Cancel' : 'Edit'}
        </button>
      </div>
      
      {isOpen ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="dailyGoal" className="text-sm mb-1">Daily Goal (ml):</label>
            <input
              id="dailyGoal"
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="bottleSize" className="text-sm mb-1">Default Bottle Size (ml):</label>
            <input
              id="bottleSize"
              type="number"
              min="1"
              value={bottleSizeInput}
              onChange={(e) => setBottleSizeInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <button 
            className="btn"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between py-2 border-b">
            <span>Daily Goal</span>
            <span className="font-medium">{state.dailyGoal}ml</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Default Bottle Size</span>
            <span className="font-medium">{bottleSize}ml</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 