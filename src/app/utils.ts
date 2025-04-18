import { format } from 'date-fns';
import { DailyData, DrinkEntry, DrinkType, TrackerState } from './types';

// Default values
export const DEFAULT_BOTTLE_SIZE = 500; // Water bottle size in ml
export const DEFAULT_MILK_GLASS_SIZE = 250; // Milk glass size in ml
export const DEFAULT_CURD_BOWL_SIZE = 100; // Curd bowl size in g
export const DEFAULT_WATER_GOAL = 2500; // Daily water goal in ml
export const DEFAULT_MILK_GOAL = 500; // Daily milk goal in ml (2 glasses)
export const DEFAULT_CURD_GOAL = 200; // Daily curd goal in g (2 bowls)
export const DEFAULT_CALCIUM_GOAL = 1000; // Daily calcium goal in mg
export const DEFAULT_PROTEIN_GOAL = 50; // Daily protein goal in g
export const CALCIUM_PER_ML_MILK = 1.2; // 300mg calcium per 250ml milk (1.2mg per ml)
export const CALCIUM_PER_G_CURD = 0.9; // 90mg calcium per 100g curd (0.9mg per g)
export const PROTEIN_PER_ML_MILK = 0.032; // 8g protein per 250ml milk (0.032g per ml)
export const PROTEIN_PER_G_CURD = 0.035; // 11g protein per 100g curd (0.11g per g)
export const PROTEIN_PER_EGG = 7; // 7g protein per egg

// Custom entry types
export enum CustomEntryType {
  EGG = 'egg'
}

// Structure for egg entry
export interface CustomEntry {
  id: string;
  amount: number; // count for eggs
  timestamp: Date;
  type: CustomEntryType;
}

// Format date to YYYY-MM-DD for consistent storage
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get today's date in YYYY-MM-DD format
export const getToday = (): string => {
  return formatDate(new Date());
};

// Initialize the state with default values
export const initializeState = (): TrackerState => {
  const today = getToday();
  
  return {
    entries: [],
    waterGoal: DEFAULT_WATER_GOAL,
    milkGoal: DEFAULT_MILK_GOAL,
    curdGoal: DEFAULT_CURD_GOAL,
    calciumGoal: DEFAULT_CALCIUM_GOAL,
    proteinGoal: DEFAULT_PROTEIN_GOAL,
    data: {
      [today]: {
        date: today,
        totalWaterAmount: 0,
        totalMilkAmount: 0,
        totalCurdAmount: 0,
        totalCalciumAmount: 0,
        totalProteinAmount: 0,
        entries: [],
        waterGoal: DEFAULT_WATER_GOAL,
        milkGoal: DEFAULT_MILK_GOAL,
        curdGoal: DEFAULT_CURD_GOAL,
        calciumGoal: DEFAULT_CALCIUM_GOAL,
        proteinGoal: DEFAULT_PROTEIN_GOAL
      }
    }
  };
};

// Add a new drink entry to the state
export const addDrinkEntry = (
  state: TrackerState,
  amount: number,
  type: DrinkType
): TrackerState => {
  const timestamp = new Date();
  const dateKey = formatDate(timestamp);
  
  const newEntry: DrinkEntry = {
    id: timestamp.getTime().toString(),
    amount,
    timestamp,
    type
  };
  
  // Create or update the daily data
  const currentDailyData = state.data[dateKey] || {
    date: dateKey,
    totalWaterAmount: 0,
    totalMilkAmount: 0,
    totalCurdAmount: 0,
    totalCalciumAmount: 0,
    totalProteinAmount: 0,
    entries: [],
    waterGoal: state.waterGoal,
    milkGoal: state.milkGoal,
    curdGoal: state.curdGoal,
    calciumGoal: state.calciumGoal,
    proteinGoal: state.proteinGoal
  };
  
  // Calculate calcium and protein based on entry type
  let calciumAmount = 0;
  let proteinAmount = 0;
  if (type === DrinkType.MILK) {
    calciumAmount = amount * CALCIUM_PER_ML_MILK;
    proteinAmount = amount * PROTEIN_PER_ML_MILK;
  } else if (type === DrinkType.CURD) {
    calciumAmount = amount * CALCIUM_PER_G_CURD;
    proteinAmount = amount * PROTEIN_PER_G_CURD;
  }
  
  const updatedDailyData: DailyData = {
    ...currentDailyData,
    totalWaterAmount: type === DrinkType.WATER 
      ? currentDailyData.totalWaterAmount + amount 
      : currentDailyData.totalWaterAmount,
    totalMilkAmount: type === DrinkType.MILK 
      ? currentDailyData.totalMilkAmount + amount 
      : currentDailyData.totalMilkAmount,
    totalCurdAmount: type === DrinkType.CURD
      ? currentDailyData.totalCurdAmount + amount
      : currentDailyData.totalCurdAmount,
    totalCalciumAmount: currentDailyData.totalCalciumAmount + calciumAmount,
    totalProteinAmount: currentDailyData.totalProteinAmount + proteinAmount,
    entries: [...currentDailyData.entries, newEntry]
  };
  
  return {
    ...state,
    entries: [...state.entries, newEntry],
    data: {
      ...state.data,
      [dateKey]: updatedDailyData
    }
  };
};

// Add water entry (for backward compatibility)
export const addWaterEntry = (
  state: TrackerState,
  amount: number = DEFAULT_BOTTLE_SIZE
): TrackerState => {
  return addDrinkEntry(state, amount, DrinkType.WATER);
};

// Add milk entry
export const addMilkEntry = (
  state: TrackerState,
  amount: number = DEFAULT_MILK_GLASS_SIZE
): TrackerState => {
  return addDrinkEntry(state, amount, DrinkType.MILK);
};

// Add curd entry
export const addCurdEntry = (
  state: TrackerState,
  amount: number = DEFAULT_CURD_BOWL_SIZE
): TrackerState => {
  return addDrinkEntry(state, amount, DrinkType.CURD);
};

// Add protein from egg
export const addEggProtein = (
  state: TrackerState,
  eggCount: number = 1
): TrackerState => {
  const timestamp = new Date();
  const dateKey = formatDate(timestamp);
  
  // Get current daily data or create new one
  const currentDailyData = state.data[dateKey] || {
    date: dateKey,
    totalWaterAmount: 0,
    totalMilkAmount: 0,
    totalCurdAmount: 0,
    totalCalciumAmount: 0,
    totalProteinAmount: 0,
    entries: [],
    waterGoal: state.waterGoal,
    milkGoal: state.milkGoal,
    curdGoal: state.curdGoal,
    calciumGoal: state.calciumGoal,
    proteinGoal: state.proteinGoal
  };
  
  // Calculate protein from eggs
  const proteinAmount = eggCount * PROTEIN_PER_EGG;
  
  // Create a custom egg entry
  const eggEntry: DrinkEntry = {
    id: timestamp.getTime().toString(),
    amount: eggCount,
    timestamp,
    type: CustomEntryType.EGG as any // This is a hack, but it works for our UI purposes
  };
  
  // Update daily data with new protein amount and egg entry
  const updatedDailyData: DailyData = {
    ...currentDailyData,
    totalProteinAmount: currentDailyData.totalProteinAmount + proteinAmount,
    entries: [...currentDailyData.entries, eggEntry]
  };
  
  return {
    ...state,
    entries: [...state.entries, eggEntry],
    data: {
      ...state.data,
      [dateKey]: updatedDailyData
    }
  };
};

// Delete a drink entry from the state
export const deleteDrinkEntry = (
  state: TrackerState,
  entryId: string
): TrackerState => {
  // Find the entry to be deleted
  const entryToDelete = state.entries.find(entry => entry.id === entryId);
  
  if (!entryToDelete) {
    return state; // Entry not found, return state unchanged
  }
  
  // Find which day this entry belongs to
  const dateKey = formatDate(entryToDelete.timestamp);
  const dailyData = state.data[dateKey];
  
  if (!dailyData) {
    return state; // Day data not found, return state unchanged
  }
  
  // Calculate the calcium and protein to remove based on entry type
  let calciumToRemove = 0;
  let proteinToRemove = 0;
  
  if (entryToDelete.type === DrinkType.MILK) {
    calciumToRemove = entryToDelete.amount * CALCIUM_PER_ML_MILK;
    proteinToRemove = entryToDelete.amount * PROTEIN_PER_ML_MILK;
  } else if (entryToDelete.type === DrinkType.CURD) {
    calciumToRemove = entryToDelete.amount * CALCIUM_PER_G_CURD;
    proteinToRemove = entryToDelete.amount * PROTEIN_PER_G_CURD;
  } else if (entryToDelete.type === CustomEntryType.EGG as any) {
    proteinToRemove = entryToDelete.amount * PROTEIN_PER_EGG;
  }
  
  // Update the appropriate totals based on drink type
  let updatedTotalWaterAmount = dailyData.totalWaterAmount;
  let updatedTotalMilkAmount = dailyData.totalMilkAmount;
  let updatedTotalCurdAmount = dailyData.totalCurdAmount;
  let updatedTotalCalciumAmount = dailyData.totalCalciumAmount - calciumToRemove;
  let updatedTotalProteinAmount = dailyData.totalProteinAmount - proteinToRemove;
  
  if (entryToDelete.type === DrinkType.WATER) {
    updatedTotalWaterAmount -= entryToDelete.amount;
  } else if (entryToDelete.type === DrinkType.MILK) {
    updatedTotalMilkAmount -= entryToDelete.amount;
  } else if (entryToDelete.type === DrinkType.CURD) {
    updatedTotalCurdAmount -= entryToDelete.amount;
  }
  
  // Remove the entry from the day's entries and update the totals
  const updatedDailyEntries = dailyData.entries.filter(entry => entry.id !== entryId);
  
  const updatedDailyData: DailyData = {
    ...dailyData,
    totalWaterAmount: Math.max(0, updatedTotalWaterAmount),
    totalMilkAmount: Math.max(0, updatedTotalMilkAmount),
    totalCurdAmount: Math.max(0, updatedTotalCurdAmount),
    totalCalciumAmount: Math.max(0, updatedTotalCalciumAmount),
    totalProteinAmount: Math.max(0, updatedTotalProteinAmount),
    entries: updatedDailyEntries
  };
  
  // Update the state with the entry removed
  return {
    ...state,
    entries: state.entries.filter(entry => entry.id !== entryId),
    data: {
      ...state.data,
      [dateKey]: updatedDailyData
    }
  };
};

// For backward compatibility
export const deleteWaterEntry = deleteDrinkEntry;

// Calculate percentage of goal reached
export const calculateProgress = (total: number, goal: number): number => {
  return Math.min(Math.round((total / goal) * 100), 100);
};

// Get the last 7 days of data
export const getLast7DaysData = (state: TrackerState): DailyData[] => {
  const today = new Date();
  const result: DailyData[] = [];
  
  // Loop through the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = formatDate(date);
    
    if (state.data[dateKey]) {
      result.push(state.data[dateKey]);
    } else {
      // Create empty data for days with no entries
      result.push({
        date: dateKey,
        totalWaterAmount: 0,
        totalMilkAmount: 0,
        totalCurdAmount: 0,
        totalCalciumAmount: 0,
        totalProteinAmount: 0,
        entries: [],
        waterGoal: state.waterGoal,
        milkGoal: state.milkGoal,
        curdGoal: state.curdGoal,
        calciumGoal: state.calciumGoal,
        proteinGoal: state.proteinGoal
      });
    }
  }
  
  return result;
}; 