import { format } from 'date-fns';
import { DailyWaterData, WaterEntry, WaterTrackerState } from './types';

// Default bottle size in ml (500ml)
export const DEFAULT_BOTTLE_SIZE = 500;

// Default daily water goal in ml (2500ml = 2.5L)
export const DEFAULT_DAILY_GOAL = 2500;

// Format date to YYYY-MM-DD for consistent storage
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get today's date in YYYY-MM-DD format
export const getToday = (): string => {
  return formatDate(new Date());
};

// Initialize the state with default values
export const initializeState = (): WaterTrackerState => {
  const today = getToday();
  
  return {
    entries: [],
    dailyGoal: DEFAULT_DAILY_GOAL,
    waterData: {
      [today]: {
        date: today,
        totalAmount: 0,
        entries: [],
        goal: DEFAULT_DAILY_GOAL
      }
    }
  };
};

// Add a new water entry to the state
export const addWaterEntry = (
  state: WaterTrackerState,
  amount: number = DEFAULT_BOTTLE_SIZE
): WaterTrackerState => {
  const timestamp = new Date();
  const dateKey = formatDate(timestamp);
  
  const newEntry: WaterEntry = {
    id: timestamp.getTime().toString(),
    amount,
    timestamp
  };
  
  // Create or update the daily data
  const currentDailyData = state.waterData[dateKey] || {
    date: dateKey,
    totalAmount: 0,
    entries: [],
    goal: state.dailyGoal
  };
  
  const updatedDailyData: DailyWaterData = {
    ...currentDailyData,
    totalAmount: currentDailyData.totalAmount + amount,
    entries: [...currentDailyData.entries, newEntry]
  };
  
  return {
    ...state,
    entries: [...state.entries, newEntry],
    waterData: {
      ...state.waterData,
      [dateKey]: updatedDailyData
    }
  };
};

// Delete a water entry from the state
export const deleteWaterEntry = (
  state: WaterTrackerState,
  entryId: string
): WaterTrackerState => {
  // Find the entry to be deleted
  const entryToDelete = state.entries.find(entry => entry.id === entryId);
  
  if (!entryToDelete) {
    return state; // Entry not found, return state unchanged
  }
  
  // Find which day this entry belongs to
  const dateKey = formatDate(entryToDelete.timestamp);
  const dailyData = state.waterData[dateKey];
  
  if (!dailyData) {
    return state; // Day data not found, return state unchanged
  }
  
  // Remove the entry from the day's entries and update the total amount
  const updatedDailyEntries = dailyData.entries.filter(entry => entry.id !== entryId);
  const updatedTotalAmount = dailyData.totalAmount - entryToDelete.amount;
  
  const updatedDailyData: DailyWaterData = {
    ...dailyData,
    totalAmount: Math.max(0, updatedTotalAmount), // Ensure total doesn't go below 0
    entries: updatedDailyEntries
  };
  
  // Update the state with the entry removed
  return {
    ...state,
    entries: state.entries.filter(entry => entry.id !== entryId),
    waterData: {
      ...state.waterData,
      [dateKey]: updatedDailyData
    }
  };
};

// Calculate percentage of daily goal reached
export const calculateProgress = (total: number, goal: number): number => {
  return Math.min(Math.round((total / goal) * 100), 100);
};

// Get the last 7 days of water data
export const getLast7DaysData = (state: WaterTrackerState): DailyWaterData[] => {
  const today = new Date();
  const result: DailyWaterData[] = [];
  
  // Loop through the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = formatDate(date);
    
    if (state.waterData[dateKey]) {
      result.push(state.waterData[dateKey]);
    } else {
      // Create empty data for days with no entries
      result.push({
        date: dateKey,
        totalAmount: 0,
        entries: [],
        goal: state.dailyGoal
      });
    }
  }
  
  return result;
}; 