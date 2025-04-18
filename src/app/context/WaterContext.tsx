'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DrinkType, TrackerState } from '../types';
import { DEFAULT_BOTTLE_SIZE, DEFAULT_CALCIUM_GOAL, DEFAULT_MILK_GLASS_SIZE, DEFAULT_MILK_GOAL, DEFAULT_WATER_GOAL, DEFAULT_CURD_BOWL_SIZE, DEFAULT_CURD_GOAL, DEFAULT_PROTEIN_GOAL, CALCIUM_PER_ML_MILK, CALCIUM_PER_G_CURD, PROTEIN_PER_EGG, PROTEIN_PER_ML_MILK, PROTEIN_PER_G_CURD, CustomEntryType, addWaterEntry as addWaterEntryUtil, addMilkEntry as addMilkEntryUtil, addCurdEntry as addCurdEntryUtil, addEggProtein as addEggProteinUtil, deleteDrinkEntry as deleteDrinkEntryUtil, formatDate, getToday, initializeState } from '../utils';
import { saveUserSettings, getUserSettings, addWaterEntry as addFirebaseWaterEntry, deleteWaterEntry as deleteFirebaseWaterEntry, getDailyWaterData, getWeeklyWaterData, updateProteinAmount } from '../firebase/service';
import { doc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Collection reference from firebase/service.ts
const WATER_DATA_COLLECTION = 'waterData';

// Function to get user ID from firebase/service.ts
const getUserId = (): string => {
  // Always return the same fixed ID since only one user will use this app
  return 'single_user_fixed_id';
};

// Define context type
interface WaterContextType {
  state: TrackerState;
  bottleSize: number;
  milkGlassSize: number;
  isLoading: boolean;
  addWater: (amount?: number) => void;
  addMilk: (amount?: number) => void;
  addCurd: (amount?: number) => void;
  addEgg: (count?: number) => void;
  deleteWater: (entryId: string) => void;
  setWaterGoal: (goal: number) => void;
  setMilkGoal: (goal: number) => void;
  setCurdGoal: (goal: number) => void;
  setCalciumGoal: (goal: number) => void;
  setProteinGoal: (goal: number) => void;
  setBottleSize: (size: number) => void;
  setMilkGlassSize: (size: number) => void;
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
  const [state, setState] = useState<TrackerState>(initializeState());
  const [bottleSize, setBottleSize] = useState<number>(DEFAULT_BOTTLE_SIZE);
  const [milkGlassSize, setMilkGlassSize] = useState<number>(DEFAULT_MILK_GLASS_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load settings
        const settings = await getUserSettings();
        
        // Default settings if none found
        const userSettings = settings || {
          dailyGoal: DEFAULT_WATER_GOAL,
          bottleSize: DEFAULT_BOTTLE_SIZE,
          milkGoal: DEFAULT_MILK_GOAL,
          milkGlassSize: DEFAULT_MILK_GLASS_SIZE,
          calciumGoal: DEFAULT_CALCIUM_GOAL,
          curdGoal: DEFAULT_CURD_GOAL,
          proteinGoal: DEFAULT_PROTEIN_GOAL
        };
        
        // Apply settings to state
        setBottleSize(userSettings.bottleSize);
        setMilkGlassSize(userSettings.milkGlassSize);
        
        // Initialize state with user settings
        const initialState = initializeState();
        initialState.waterGoal = userSettings.dailyGoal;
        initialState.milkGoal = userSettings.milkGoal;
        initialState.curdGoal = userSettings.curdGoal;
        initialState.calciumGoal = userSettings.calciumGoal;
        initialState.proteinGoal = userSettings.proteinGoal || DEFAULT_PROTEIN_GOAL;
        
        // Load today's data
        const today = getToday();
        const todayData = await getDailyWaterData(today);
        
        if (todayData) {
          // Get weekly data with the correct goals
          const weeklyData = await getWeeklyWaterData(
            userSettings.dailyGoal,
            userSettings.milkGoal,
            userSettings.calciumGoal
          );
          
          // Create a mapping of date to daily data
          const dataMap: Record<string, any> = {};
          weeklyData.forEach(day => {
            // Ensure each day has the correct goals
            dataMap[day.date] = {
              ...day,
              waterGoal: userSettings.dailyGoal,
              milkGoal: userSettings.milkGoal,
              curdGoal: userSettings.curdGoal,
              calciumGoal: userSettings.calciumGoal,
              proteinGoal: userSettings.proteinGoal || DEFAULT_PROTEIN_GOAL,
              totalProteinAmount: day.totalProteinAmount || 0
            };
          });
          
          // Update state with Firebase data and correct goals
          setState({
            ...initialState,
            entries: todayData.entries,
            data: dataMap
          });
        } else {
          // No data yet, just use initialized state with settings
          setState(initialState);
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        setState(initializeState());
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
      
      const newEntry = {
        id: timestamp.getTime().toString(),
        amount,
        timestamp,
        type: DrinkType.WATER
      };
      
      // Update local state
      setState(prevState => addWaterEntryUtil(prevState, amount));
      
      // Save to Firebase
      await addFirebaseWaterEntry(newEntry, dateKey);
      
    } catch (error) {
      console.error('Error adding water entry:', error);
    }
  };

  // Add a new milk entry
  const addMilk = async (amount = milkGlassSize) => {
    try {
      const timestamp = new Date();
      const dateKey = formatDate(timestamp);
      
      const newEntry = {
        id: timestamp.getTime().toString(),
        amount,
        timestamp,
        type: DrinkType.MILK
      };
      
      // Update local state
      setState(prevState => addMilkEntryUtil(prevState, amount));
      
      // Save to Firebase
      await addFirebaseWaterEntry(newEntry, dateKey);
      
    } catch (error) {
      console.error('Error adding milk entry:', error);
    }
  };

  // Add a new curd entry
  const addCurd = async (amount = DEFAULT_CURD_BOWL_SIZE) => {
    try {
      const timestamp = new Date();
      const dateKey = formatDate(timestamp);
      
      const newEntry = {
        id: timestamp.getTime().toString(),
        amount,
        timestamp,
        type: DrinkType.CURD
      };
      
      // Update local state
      setState(prevState => addCurdEntryUtil(prevState, amount));
      
      // Save to Firebase
      await addFirebaseWaterEntry(newEntry, dateKey);
      
    } catch (error) {
      console.error('Error adding curd entry:', error);
    }
  };

  // Add an egg for protein tracking
  const addEgg = async (count = 1) => {
    try {
      const timestamp = new Date();
      const dateKey = formatDate(timestamp);
      const proteinAmount = count * PROTEIN_PER_EGG;
      
      // Create an egg entry for consistent storage
      const newEntry = {
        id: timestamp.getTime().toString(),
        amount: count,
        timestamp,
        type: CustomEntryType.EGG
      };
      
      // Update local state with egg protein
      setState(prevState => addEggProteinUtil(prevState, count));
      
      // Update the protein count in Firebase
      await updateProteinAmount(dateKey, proteinAmount);
      
      // Store the egg entry in Firebase entries array to ensure it persists on refresh
      // We need to manually add it to Firebase entries since updateProteinAmount only updates the total
      const userId = getUserId();
      const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
      
      // Get current Firebase document
      const q = query(
        collection(db, WATER_DATA_COLLECTION),
        where('__name__', '==', `${userId}_${dateKey}`)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Add the egg entry to the entries array
        await updateDoc(dailyWaterRef, {
          entries: arrayUnion({
            id: newEntry.id,
            amount: newEntry.amount,
            timestamp: Timestamp.fromDate(newEntry.timestamp),
            type: newEntry.type
          })
        });
      }
      
      console.log(`Added ${count} egg(s) with ${proteinAmount}g of protein`);
      
    } catch (error) {
      console.error('Error adding egg protein:', error);
    }
  };

  // Delete a water entry
  const deleteWater = async (entryId: string) => {
    try {
      console.log(`Attempting to delete entry with ID: ${entryId}`);
      
      // Find the entry to delete
      const entryToDelete = state.entries.find(entry => entry.id === entryId);
      if (!entryToDelete) {
        console.error(`Entry with ID ${entryId} not found in state`);
        return;
      }
      
      const dateKey = formatDate(entryToDelete.timestamp);
      console.log(`Found entry, date key: ${dateKey}, type: ${entryToDelete.type}, amount: ${entryToDelete.amount}`);
      
      // Check if it's an egg entry (eggs aren't stored in Firebase as regular entries)
      const isEggEntry = entryToDelete.type === CustomEntryType.EGG as any;
      
      // Delete from Firebase - handle egg entries differently
      if (isEggEntry) {
        // For egg entries, we need to update the protein amount in Firebase
        const proteinToRemove = -(entryToDelete.amount * PROTEIN_PER_EGG); // Negative to reduce the amount
        await updateProteinAmount(dateKey, proteinToRemove);
        
        // Remove the egg entry from Firebase entries array
        // Since we're manually adding egg entries to Firebase entries array, we need to manually remove them
        const userId = getUserId();
        const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
        
        await updateDoc(dailyWaterRef, {
          entries: arrayRemove({
            id: entryToDelete.id,
            amount: entryToDelete.amount,
            timestamp: Timestamp.fromDate(entryToDelete.timestamp),
            type: entryToDelete.type
          })
        });
      } else {
        // For regular entries, use the standard delete function
        await deleteFirebaseWaterEntry(entryId, dateKey, entryToDelete.amount, entryToDelete.type);
      }
      
      // Update local state regardless of entry type
      setState(prevState => {
        // Create a fresh copy of state
        const updatedEntries = prevState.entries.filter(entry => entry.id !== entryId);
        
        // Get current daily data
        const currentDailyData = prevState.data[dateKey];
        if (!currentDailyData) {
          console.error(`No daily data found for date: ${dateKey}`);
          return prevState;
        }
        
        // Remove entry from daily data
        const updatedDailyEntries = currentDailyData.entries.filter(entry => entry.id !== entryId);
        
        // Recalculate totals
        let updatedTotalWaterAmount = currentDailyData.totalWaterAmount;
        let updatedTotalMilkAmount = currentDailyData.totalMilkAmount;
        let updatedTotalCurdAmount = currentDailyData.totalCurdAmount;
        let updatedTotalCalciumAmount = currentDailyData.totalCalciumAmount;
        let updatedTotalProteinAmount = currentDailyData.totalProteinAmount;
        
        // Subtract from appropriate total
        if (entryToDelete.type === DrinkType.WATER) {
          updatedTotalWaterAmount = Math.max(0, updatedTotalWaterAmount - entryToDelete.amount);
        } else if (entryToDelete.type === DrinkType.MILK) {
          updatedTotalMilkAmount = Math.max(0, updatedTotalMilkAmount - entryToDelete.amount);
          const calciumToRemove = entryToDelete.amount * CALCIUM_PER_ML_MILK;
          const proteinToRemove = entryToDelete.amount * PROTEIN_PER_ML_MILK;
          updatedTotalCalciumAmount = Math.max(0, updatedTotalCalciumAmount - calciumToRemove);
          updatedTotalProteinAmount = Math.max(0, updatedTotalProteinAmount - proteinToRemove);
        } else if (entryToDelete.type === DrinkType.CURD) {
          updatedTotalCurdAmount = Math.max(0, updatedTotalCurdAmount - entryToDelete.amount);
          const calciumToRemove = entryToDelete.amount * CALCIUM_PER_G_CURD;
          const proteinToRemove = entryToDelete.amount * PROTEIN_PER_G_CURD;
          updatedTotalCalciumAmount = Math.max(0, updatedTotalCalciumAmount - calciumToRemove);
          updatedTotalProteinAmount = Math.max(0, updatedTotalProteinAmount - proteinToRemove);
        } else if (isEggEntry) {
          // For egg entries, just remove the protein
          const proteinToRemove = entryToDelete.amount * PROTEIN_PER_EGG;
          updatedTotalProteinAmount = Math.max(0, updatedTotalProteinAmount - proteinToRemove);
        }
        
        // Create updated daily data
        const updatedDailyData = {
          ...currentDailyData,
          totalWaterAmount: updatedTotalWaterAmount,
          totalMilkAmount: updatedTotalMilkAmount,
          totalCurdAmount: updatedTotalCurdAmount,
          totalCalciumAmount: updatedTotalCalciumAmount,
          totalProteinAmount: updatedTotalProteinAmount,
          entries: updatedDailyEntries
        };
        
        // Return updated state
        return {
          ...prevState,
          entries: updatedEntries,
          data: {
            ...prevState.data,
            [dateKey]: updatedDailyData
          }
        };
      });
      
      console.log(`Entry ${entryId} deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Set the daily water goal
  const setWaterGoal = async (goal: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };

      // Update local state
      setState(prevState => {
        // Update the goals in all daily data
        const updatedData = { ...prevState.data };
        Object.keys(updatedData).forEach(date => {
          updatedData[date] = {
            ...updatedData[date],
            waterGoal: goal
          };
        });
        
        return {
          ...prevState,
          waterGoal: goal,
          data: updatedData
        };
      });
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: goal,
        bottleSize: currentSettings.bottleSize,
        milkGoal: currentSettings.milkGoal,
        milkGlassSize: currentSettings.milkGlassSize,
        calciumGoal: currentSettings.calciumGoal,
        curdGoal: currentSettings.curdGoal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating water goal:', error);
    }
  };

  // Set the daily milk goal
  const setMilkGoal = async (goal: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };
      
      // Update local state
      setState(prevState => {
        // Update the goals in all daily data
        const updatedData = { ...prevState.data };
        Object.keys(updatedData).forEach(date => {
          updatedData[date] = {
            ...updatedData[date],
            milkGoal: goal
          };
        });
        
        return {
          ...prevState,
          milkGoal: goal,
          data: updatedData
        };
      });
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: currentSettings.dailyGoal,
        bottleSize: currentSettings.bottleSize,
        milkGoal: goal,
        milkGlassSize: currentSettings.milkGlassSize,
        calciumGoal: currentSettings.calciumGoal,
        curdGoal: currentSettings.curdGoal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating milk goal:', error);
    }
  };

  // Set the daily curd goal
  const setCurdGoal = async (goal: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };
      
      // Update local state
      setState(prevState => {
        // Update the goals in all daily data
        const updatedData = { ...prevState.data };
        Object.keys(updatedData).forEach(date => {
          updatedData[date] = {
            ...updatedData[date],
            curdGoal: goal
          };
        });
        
        return {
          ...prevState,
          curdGoal: goal,
          data: updatedData
        };
      });
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: currentSettings.dailyGoal,
        bottleSize: currentSettings.bottleSize,
        milkGoal: currentSettings.milkGoal,
        milkGlassSize: currentSettings.milkGlassSize,
        calciumGoal: currentSettings.calciumGoal,
        curdGoal: goal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating curd goal:', error);
    }
  };

  // Set the daily calcium goal
  const setCalciumGoal = async (goal: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };
      
      // Update local state
      setState(prevState => {
        // Update the goals in all daily data
        const updatedData = { ...prevState.data };
        Object.keys(updatedData).forEach(date => {
          updatedData[date] = {
            ...updatedData[date],
            calciumGoal: goal
          };
        });
        
        return {
          ...prevState,
          calciumGoal: goal,
          data: updatedData
        };
      });
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: currentSettings.dailyGoal,
        bottleSize: currentSettings.bottleSize,
        milkGoal: currentSettings.milkGoal,
        milkGlassSize: currentSettings.milkGlassSize,
        calciumGoal: goal,
        curdGoal: currentSettings.curdGoal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating calcium goal:', error);
    }
  };

  // Set protein goal
  const setProteinGoal = async (goal: number) => {
    try {
      // Update local state
      setState(prevState => {
        // Update today's goal
        const today = getToday();
        const updatedData = { ...prevState.data };
        
        // Update today's data if it exists
        if (updatedData[today]) {
          updatedData[today] = {
            ...updatedData[today],
            proteinGoal: goal
          };
        }
        
        // Return updated state
        return {
          ...prevState,
          proteinGoal: goal,
          data: updatedData
        };
      });
      
      // Save to Firebase user settings
      await saveUserSettings({
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: goal
      });
      
      console.log(`Updated protein goal to ${goal}g`);
      
    } catch (error) {
      console.error('Error updating protein goal:', error);
    }
  };

  // Update bottle size
  const handleSetBottleSize = async (size: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };
      
      // Update local state
      setBottleSize(size);
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: currentSettings.dailyGoal,
        bottleSize: size,
        milkGoal: currentSettings.milkGoal,
        milkGlassSize: currentSettings.milkGlassSize,
        calciumGoal: currentSettings.calciumGoal,
        curdGoal: currentSettings.curdGoal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating bottle size:', error);
    }
  };

  // Update milk glass size
  const handleSetMilkGlassSize = async (size: number) => {
    try {
      // First fetch the latest settings to ensure we don't override other values
      const currentSettings = await getUserSettings() || {
        dailyGoal: state.waterGoal,
        bottleSize,
        milkGoal: state.milkGoal,
        milkGlassSize,
        calciumGoal: state.calciumGoal,
        curdGoal: state.curdGoal,
        proteinGoal: state.proteinGoal
      };
      
      // Update local state
      setMilkGlassSize(size);
      
      // Save to Firebase with all current settings
      await saveUserSettings({
        dailyGoal: currentSettings.dailyGoal,
        bottleSize: currentSettings.bottleSize,
        milkGoal: currentSettings.milkGoal,
        milkGlassSize: size,
        calciumGoal: currentSettings.calciumGoal,
        curdGoal: currentSettings.curdGoal,
        proteinGoal: currentSettings.proteinGoal
      });
      
    } catch (error) {
      console.error('Error updating milk glass size:', error);
    }
  };

  // Context value
  const contextValue: WaterContextType = {
    state,
    bottleSize,
    milkGlassSize,
    isLoading,
    addWater,
    addMilk,
    addCurd,
    addEgg,
    deleteWater,
    setWaterGoal,
    setMilkGoal,
    setCurdGoal,
    setCalciumGoal,
    setProteinGoal,
    setBottleSize: handleSetBottleSize,
    setMilkGlassSize: handleSetMilkGlassSize
  };

  return (
    <WaterContext.Provider value={contextValue}>
      {children}
    </WaterContext.Provider>
  );
}; 