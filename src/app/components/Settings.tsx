'use client';

import React, { useState, useEffect } from 'react';
import { useWaterTracker } from '../context/WaterContext';
import { DEFAULT_CURD_BOWL_SIZE } from '../utils';

const Settings: React.FC = () => {
  const { 
    state, 
    bottleSize, 
    milkGlassSize,
    setWaterGoal, 
    setMilkGoal,
    setCurdGoal,
    setCalciumGoal,
    setProteinGoal,
    setBottleSize,
    setMilkGlassSize
  } = useWaterTracker();
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [waterGoalInput, setWaterGoalInput] = useState<number>(state.waterGoal);
  const [milkGoalInput, setMilkGoalInput] = useState<number>(state.milkGoal);
  const [curdGoalInput, setCurdGoalInput] = useState<number>(state.curdGoal);
  const [calciumGoalInput, setCalciumGoalInput] = useState<number>(state.calciumGoal);
  const [proteinGoalInput, setProteinGoalInput] = useState<number>(state.proteinGoal);
  const [bottleSizeInput, setBottleSizeInput] = useState<number>(bottleSize);
  const [milkGlassSizeInput, setMilkGlassSizeInput] = useState<number>(milkGlassSize);
  const [curdBowlSizeInput, setCurdBowlSizeInput] = useState<number>(DEFAULT_CURD_BOWL_SIZE);
  
  // Update input fields when state changes (e.g., when values are loaded from Firebase)
  useEffect(() => {
    setWaterGoalInput(state.waterGoal);
    setMilkGoalInput(state.milkGoal);
    setCurdGoalInput(state.curdGoal);
    setCalciumGoalInput(state.calciumGoal);
    setProteinGoalInput(state.proteinGoal);
    setBottleSizeInput(bottleSize);
    setMilkGlassSizeInput(milkGlassSize);
    setCurdBowlSizeInput(DEFAULT_CURD_BOWL_SIZE);
  }, [state.waterGoal, state.milkGoal, state.curdGoal, state.calciumGoal, state.proteinGoal, bottleSize, milkGlassSize]);
  
  // Reset inputs when opening the edit dialog
  useEffect(() => {
    if (isOpen) {
      setWaterGoalInput(state.waterGoal);
      setMilkGoalInput(state.milkGoal);
      setCurdGoalInput(state.curdGoal);
      setCalciumGoalInput(state.calciumGoal);
      setProteinGoalInput(state.proteinGoal);
      setBottleSizeInput(bottleSize);
      setMilkGlassSizeInput(milkGlassSize);
      setCurdBowlSizeInput(DEFAULT_CURD_BOWL_SIZE);
    }
  }, [isOpen, state.waterGoal, state.milkGoal, state.curdGoal, state.calciumGoal, state.proteinGoal, bottleSize, milkGlassSize]);
  
  const handleSave = async () => {
    if (waterGoalInput > 0) {
      await setWaterGoal(waterGoalInput);
    }
    
    if (milkGoalInput > 0) {
      await setMilkGoal(milkGoalInput);
    }
    
    if (curdGoalInput > 0) {
      await setCurdGoal(curdGoalInput);
    }
    
    if (calciumGoalInput > 0) {
      await setCalciumGoal(calciumGoalInput);
    }
    
    if (proteinGoalInput > 0) {
      await setProteinGoal(proteinGoalInput);
    }
    
    if (bottleSizeInput > 0) {
      await setBottleSize(bottleSizeInput);
    }
    
    if (milkGlassSizeInput > 0) {
      await setMilkGlassSize(milkGlassSizeInput);
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
            <label htmlFor="waterGoal" className="text-sm mb-1">Daily Water Goal (ml):</label>
            <input
              id="waterGoal"
              type="number"
              min="1"
              value={waterGoalInput}
              onChange={(e) => setWaterGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="milkGoal" className="text-sm mb-1">Daily Milk Goal (ml):</label>
            <input
              id="milkGoal"
              type="number"
              min="1"
              value={milkGoalInput}
              onChange={(e) => setMilkGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="curdGoal" className="text-sm mb-1">Daily Curd Goal (g):</label>
            <input
              id="curdGoal"
              type="number"
              min="1"
              value={curdGoalInput}
              onChange={(e) => setCurdGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="calciumGoal" className="text-sm mb-1">Daily Calcium Goal (mg):</label>
            <input
              id="calciumGoal"
              type="number"
              min="1"
              value={calciumGoalInput}
              onChange={(e) => setCalciumGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="proteinGoal" className="text-sm mb-1">Daily Protein Goal (g):</label>
            <input
              id="proteinGoal"
              type="number"
              min="1"
              value={proteinGoalInput}
              onChange={(e) => setProteinGoalInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="bottleSize" className="text-sm mb-1">Default Water Bottle Size (ml):</label>
            <input
              id="bottleSize"
              type="number"
              min="1"
              value={bottleSizeInput}
              onChange={(e) => setBottleSizeInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="milkGlassSize" className="text-sm mb-1">Default Milk Glass Size (ml):</label>
            <input
              id="milkGlassSize"
              type="number"
              min="1"
              value={milkGlassSizeInput}
              onChange={(e) => setMilkGlassSizeInput(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="curdBowlSize" className="text-sm mb-1">Default Curd Bowl Size (g):</label>
            <input
              id="curdBowlSize"
              type="number"
              min="1"
              value={curdBowlSizeInput}
              onChange={(e) => setCurdBowlSizeInput(Number(e.target.value))}
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
            <span>Daily Water Goal</span>
            <span className="font-medium">{state.waterGoal}ml</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Daily Milk Goal</span>
            <span className="font-medium">{state.milkGoal}ml</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Daily Curd Goal</span>
            <span className="font-medium">{state.curdGoal}g</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Daily Calcium Goal</span>
            <span className="font-medium">{state.calciumGoal}mg</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Daily Protein Goal</span>
            <span className="font-medium">{state.proteinGoal}g</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Water Bottle Size</span>
            <span className="font-medium">{bottleSize}ml</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Milk Glass Size</span>
            <span className="font-medium">{milkGlassSize}ml</span>
          </div>
          
          <div className="flex justify-between py-2">
            <span>Curd Bowl Size</span>
            <span className="font-medium">{DEFAULT_CURD_BOWL_SIZE}g</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 