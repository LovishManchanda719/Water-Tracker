'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WaterTrackerState, WaterEntry } from '../types';
import { DEFAULT_BOTTLE_SIZE, DEFAULT_DAILY_GOAL, addWaterEntry as addWaterEntryUtil, deleteWaterEntry as deleteWaterEntryUtil, formatDate, getToday, initializeState } from '../utils';
import { saveUserSettings, getUserSettings, addWaterEntry as addFirebaseWaterEntry, deleteWaterEntry as deleteFirebaseWaterEntry, getDailyWaterData, getWeeklyWaterData } from '../firebase/service';

// Define context type
interface WaterContextType {
  state: WaterTrackerState;
  bottleSize: number;
  isLoading: boolean;
  addWater: (amount?: number) => void;
  deleteWater: (entryId: string) => void;
  setDailyGoal: (goal: number) => void;
  setBottleSize: (size: number) => void;
}

// Create the context with a default undefined value
const WaterContext = createContext<WaterContextType | undefined>(undefined);

// Custom hook to use the water context
export const useWaterTracker = () => {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWaterTracker must be used within a WaterProvider');
  }
  return context;
};

// Provider component
export const WaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WaterTrackerState>(initializeState());
  const [bottleSize, setBottleSize] = useState<number>(DEFAULT_BOTTLE_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load settings
        const settings = await getUserSettings();
        if (settings) {
          setBottleSize(settings.bottleSize);
          
          // Update daily goal in state
          setState(prev => ({
            ...prev,
            dailyGoal: settings.dailyGoal
          }));
        }
        
        // Load today's data
        const today = getToday();
        const todayData = await getDailyWaterData(today);
        
        if (todayData) {
          // Get weekly data
          const weeklyData = await getWeeklyWaterData(settings?.dailyGoal || DEFAULT_DAILY_GOAL);
          
          // Create a mapping of date to daily data
          const waterDataMap: Record<string, any> = {};
          weeklyData.forEach(day => {
            waterDataMap[day.date] = day;
          });
          
          // Update state with Firebase data
          setState(prev => ({
            ...prev,
            entries: todayData.entries,
            waterData: waterDataMap
          }));
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Add a new water entry
  const addWater = async (amount = bottleSize) => {
    try {
      const timestamp = new Date();
      const dateKey = formatDate(timestamp);
      
      const newEntry: WaterEntry = {
        id: timestamp.getTime().toString(),
        amount,
        timestamp
      };
      
      // Update local state
      setState(prevState => addWaterEntryUtil(prevState, amount));
      
      // Save to Firebase
      await addFirebaseWaterEntry(newEntry, dateKey);
      
    } catch (error) {
      console.error('Error adding water entry:', error);
    }
  };

  // Delete a water entry
  const deleteWater = async (entryId: string) => {
    try {
      // Find the entry to delete
      const entryToDelete = state.entries.find(entry => entry.id === entryId);
      if (!entryToDelete) return;
      
      const dateKey = formatDate(entryToDelete.timestamp);
      
      // Update local state
      setState(prevState => deleteWaterEntryUtil(prevState, entryId));
      
      // Delete from Firebase
      await deleteFirebaseWaterEntry(entryId, dateKey, entryToDelete.amount);
      
    } catch (error) {
      console.error('Error deleting water entry:', error);
    }
  };

  // Set the daily water goal
  const setDailyGoal = async (goal: number) => {
    try {
      // Update local state
      setState(prevState => ({
        ...prevState,
        dailyGoal: goal
      }));
      
      // Save to Firebase
      await saveUserSettings(goal, bottleSize);
      
    } catch (error) {
      console.error('Error updating daily goal:', error);
    }
  };

  // Update bottle size
  const handleSetBottleSize = async (size: number) => {
    try {
      // Update local state
      setBottleSize(size);
      
      // Save to Firebase
      await saveUserSettings(state.dailyGoal, size);
      
    } catch (error) {
      console.error('Error updating bottle size:', error);
    }
  };

  return (
    <WaterContext.Provider value={{ 
      state, 
      bottleSize,
      isLoading,
      addWater, 
      deleteWater, 
      setDailyGoal,
      setBottleSize: handleSetBottleSize 
    }}>
      {children}
    </WaterContext.Provider>
  );
}; 