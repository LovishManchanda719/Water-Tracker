import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';
import { DailyData, DrinkEntry, DrinkType } from '../types';
import { CALCIUM_PER_ML_MILK, CALCIUM_PER_G_CURD, PROTEIN_PER_ML_MILK, PROTEIN_PER_G_CURD, PROTEIN_PER_EGG, formatDate, CustomEntryType } from '../utils';

// Collection references
const USERS_COLLECTION = 'users';
const WATER_DATA_COLLECTION = 'waterData';
const SETTINGS_COLLECTION = 'settings';

// Generate a unique user ID (in a real app, you would get this from authentication)
const getUserId = (): string => {
  // Always return the same fixed ID since only one user will use this app
  return 'single_user_fixed_id';
};

// Save user settings (daily goal, bottle size)
export const saveUserSettings = async (settings: {
  dailyGoal: number;
  bottleSize: number;
  milkGoal?: number;
  milkGlassSize?: number;
  calciumGoal?: number;
  curdGoal?: number;
  proteinGoal?: number;
}): Promise<void> => {
  const userId = getUserId();
  const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
  
  const {
    dailyGoal,
    bottleSize,
    milkGoal = 500,
    milkGlassSize = 250,
    calciumGoal = 1000,
    curdGoal = 200,
    proteinGoal = 50
  } = settings;
  
  await setDoc(settingsRef, {
    dailyGoal, // For backward compatibility
    bottleSize,
    milkGoal,
    milkGlassSize,
    calciumGoal,
    curdGoal,
    proteinGoal,
    updatedAt: Timestamp.now()
  }, { merge: true });
  
  // Update the goal for today's data
  const today = formatDate(new Date());
  const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${today}`);
  
  // Check if the document exists first
  const q = query(
    collection(db, WATER_DATA_COLLECTION),
    where('__name__', '==', `${userId}_${today}`)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    await updateDoc(dailyWaterRef, {
      waterGoal: dailyGoal,
      milkGoal,
      curdGoal,
      calciumGoal,
      proteinGoal
    });
  } else {
    // Create a new document with goal if it doesn't exist
    await setDoc(dailyWaterRef, {
      userId,
      date: today,
      waterGoal: dailyGoal,
      milkGoal,
      curdGoal,
      calciumGoal,
      proteinGoal,
      totalWaterAmount: 0,
      totalMilkAmount: 0,
      totalCurdAmount: 0,
      totalCalciumAmount: 0,
      totalProteinAmount: 0,
      entries: [],
      updatedAt: Timestamp.now()
    });
  }
};

// Get user settings
export const getUserSettings = async (): Promise<{ 
  dailyGoal: number, 
  bottleSize: number,
  milkGoal: number,
  milkGlassSize: number,
  calciumGoal: number,
  curdGoal: number,
  proteinGoal: number
} | null> => {
  try {
    const userId = getUserId();
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    // Use getDocs with a query to get the settings document
    const q = query(collection(db, SETTINGS_COLLECTION), where('__name__', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const settingsData = querySnapshot.docs[0].data();
      return {
        dailyGoal: settingsData.dailyGoal,
        bottleSize: settingsData.bottleSize,
        milkGoal: settingsData.milkGoal || 500,
        milkGlassSize: settingsData.milkGlassSize || 250,
        calciumGoal: settingsData.calciumGoal || 1000,
        curdGoal: settingsData.curdGoal || 200,
        proteinGoal: settingsData.proteinGoal || 50
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Add a water entry
export const addWaterEntry = async (entry: DrinkEntry, dateKey: string): Promise<void> => {
  const userId = getUserId();
  const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
  
  // Get user settings for goal
  const settings = await getUserSettings();
  const waterGoal = settings?.dailyGoal || 2500; // Use default if not found
  const milkGoal = settings?.milkGoal || 500;
  const calciumGoal = settings?.calciumGoal || 1000;
  const proteinGoal = settings?.proteinGoal || 50;
  
  // Check if the document exists
  const q = query(
    collection(db, WATER_DATA_COLLECTION),
    where('__name__', '==', `${userId}_${dateKey}`)
  );
  const querySnapshot = await getDocs(q);
  
  // Calculate calcium and protein amounts based on entry type
  let calciumAmount = 0;
  let proteinAmount = 0;
  if (entry.type === DrinkType.MILK) {
    calciumAmount = entry.amount * CALCIUM_PER_ML_MILK;
    proteinAmount = entry.amount * PROTEIN_PER_ML_MILK;
  } else if (entry.type === DrinkType.CURD) {
    calciumAmount = entry.amount * CALCIUM_PER_G_CURD;
    proteinAmount = entry.amount * PROTEIN_PER_G_CURD;
  }
  
  if (querySnapshot.empty) {
    // Create a new document with the entry
    await setDoc(dailyWaterRef, {
      userId,
      date: dateKey,
      totalWaterAmount: entry.type === DrinkType.WATER ? entry.amount : 0,
      totalMilkAmount: entry.type === DrinkType.MILK ? entry.amount : 0,
      totalCurdAmount: entry.type === DrinkType.CURD ? entry.amount : 0,
      totalCalciumAmount: calciumAmount,
      totalProteinAmount: proteinAmount,
      waterGoal,
      milkGoal,
      calciumGoal,
      proteinGoal,
      entries: [{
        id: entry.id,
        amount: entry.amount,
        timestamp: Timestamp.fromDate(entry.timestamp),
        type: entry.type
      }],
      updatedAt: Timestamp.now()
    });
  } else {
    // Add the entry to the existing document
    await setDoc(dailyWaterRef, {
      userId,
      date: dateKey,
      entries: arrayUnion({
        id: entry.id,
        amount: entry.amount,
        timestamp: Timestamp.fromDate(entry.timestamp),
        type: entry.type
      }),
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    // Get current data
    const dailyData = await getDailyWaterData(dateKey);
    
    if (dailyData) {
      // Update the appropriate total amount based on drink type
      if (entry.type === DrinkType.WATER) {
        await updateDoc(dailyWaterRef, {
          totalWaterAmount: dailyData.totalWaterAmount + entry.amount
        });
      } else if (entry.type === DrinkType.MILK) {
        await updateDoc(dailyWaterRef, {
          totalMilkAmount: dailyData.totalMilkAmount + entry.amount,
          totalCalciumAmount: dailyData.totalCalciumAmount + calciumAmount,
          totalProteinAmount: (dailyData.totalProteinAmount || 0) + proteinAmount
        });
      } else if (entry.type === DrinkType.CURD) {
        await updateDoc(dailyWaterRef, {
          totalCurdAmount: dailyData.totalCurdAmount + entry.amount,
          totalCalciumAmount: dailyData.totalCalciumAmount + calciumAmount,
          totalProteinAmount: (dailyData.totalProteinAmount || 0) + proteinAmount
        });
      }
    }
  }
};

// Delete a water entry
export const deleteWaterEntry = async (entryId: string, dateKey: string, amount: number, type: DrinkType | string): Promise<void> => {
  const userId = getUserId();
  const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
  
  try {
    // Get the current data to find the entry
    const dailyData = await getDailyWaterData(dateKey);
    
    if (!dailyData) {
      console.error(`No data found for date ${dateKey}`);
      return;
    }
    
    // Find the entry to delete
    const entryToDelete = dailyData.entries.find(e => e.id === entryId);
    
    // Special handling for egg entries
    const isEggEntry = type === 'egg' || type === CustomEntryType.EGG;
    
    // If entry doesn't exist but is an egg entry, we can still proceed with removing the protein
    if (!entryToDelete && !isEggEntry) {
      console.error(`Entry with ID ${entryId} not found`);
      return;
    }
    
    // Calculate calcium and protein to remove based on entry type
    let calciumToRemove = 0;
    let proteinToRemove = 0;
    if (type === DrinkType.MILK) {
      calciumToRemove = amount * CALCIUM_PER_ML_MILK;
      proteinToRemove = amount * PROTEIN_PER_ML_MILK;
    } else if (type === DrinkType.CURD) {
      calciumToRemove = amount * CALCIUM_PER_G_CURD;
      proteinToRemove = amount * PROTEIN_PER_G_CURD;
    } else if (isEggEntry) {
      proteinToRemove = amount * PROTEIN_PER_EGG;
    }
    
    // Remove the entry from the array if it exists
    if (entryToDelete) {
      await updateDoc(dailyWaterRef, {
        entries: arrayRemove({
          id: entryToDelete.id,
          amount: entryToDelete.amount,
          timestamp: Timestamp.fromDate(entryToDelete.timestamp),
          type: entryToDelete.type
        })
      });
    }
    
    // Update the total amount based on entry type
    if (type === DrinkType.WATER) {
      await updateDoc(dailyWaterRef, {
        totalWaterAmount: Math.max(0, dailyData.totalWaterAmount - amount)
      });
    } else if (type === DrinkType.MILK) {
      await updateDoc(dailyWaterRef, {
        totalMilkAmount: Math.max(0, dailyData.totalMilkAmount - amount),
        totalCalciumAmount: Math.max(0, dailyData.totalCalciumAmount - calciumToRemove),
        totalProteinAmount: Math.max(0, (dailyData.totalProteinAmount || 0) - proteinToRemove)
      });
    } else if (type === DrinkType.CURD) {
      await updateDoc(dailyWaterRef, {
        totalCurdAmount: Math.max(0, dailyData.totalCurdAmount - amount),
        totalCalciumAmount: Math.max(0, dailyData.totalCalciumAmount - calciumToRemove),
        totalProteinAmount: Math.max(0, (dailyData.totalProteinAmount || 0) - proteinToRemove)
      });
    } else if (isEggEntry) {
      await updateDoc(dailyWaterRef, {
        totalProteinAmount: Math.max(0, (dailyData.totalProteinAmount || 0) - proteinToRemove)
      });
    }
    
    console.log(`Deleted entry ${entryId} from ${dateKey}`);
  } catch (error) {
    console.error('Error deleting water entry:', error);
  }
};

// Get daily water data for a specific date
export const getDailyWaterData = async (dateKey: string): Promise<DailyData | null> => {
  try {
    const userId = getUserId();
    
    // Use getDocs with a query to get the document
    const q = query(
      collection(db, WATER_DATA_COLLECTION),
      where('__name__', '==', `${userId}_${dateKey}`)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      
      // Transform Firebase Timestamps to Date objects
      const entries = data.entries.map((entry: any) => ({
        id: entry.id,
        amount: entry.amount,
        timestamp: entry.timestamp.toDate(),
        type: entry.type || DrinkType.WATER
      }));
      
      // Make sure we have default values for all properties
      return {
        date: data.date,
        totalWaterAmount: data.totalWaterAmount || 0,
        totalMilkAmount: data.totalMilkAmount || 0,
        totalCurdAmount: data.totalCurdAmount || 0,
        totalCalciumAmount: data.totalCalciumAmount || 0,
        totalProteinAmount: data.totalProteinAmount || 0,
        waterGoal: data.waterGoal || 2500,
        milkGoal: data.milkGoal || 500,
        curdGoal: data.curdGoal || 200,
        calciumGoal: data.calciumGoal || 1000,
        proteinGoal: data.proteinGoal || 50,
        entries
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting daily water data:', error);
    return null;
  }
};

// Get weekly water data (last 7 days)
export const getWeeklyWaterData = async (
  waterGoal: number,
  milkGoal: number = 500,
  calciumGoal: number = 1000,
  curdGoal: number = 200,
  proteinGoal: number = 50
): Promise<DailyData[]> => {
  try {
    const userId = getUserId();
    // Get all user data
    const q = query(
      collection(db, WATER_DATA_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Transform Firebase documents to DailyData objects
    const allDays: DailyData[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Transform Firebase Timestamps to Date objects
      const entries = data.entries ? data.entries.map((entry: any) => ({
        id: entry.id,
        amount: entry.amount,
        timestamp: entry.timestamp.toDate(),
        type: entry.type || DrinkType.WATER
      })) : [];
      
      return {
        date: data.date,
        totalWaterAmount: data.totalWaterAmount || 0,
        totalMilkAmount: data.totalMilkAmount || 0,
        totalCurdAmount: data.totalCurdAmount || 0,
        totalCalciumAmount: data.totalCalciumAmount || 0,
        totalProteinAmount: data.totalProteinAmount || 0,
        waterGoal: data.waterGoal || waterGoal,
        milkGoal: data.milkGoal || milkGoal,
        curdGoal: data.curdGoal || curdGoal,
        calciumGoal: data.calciumGoal || calciumGoal,
        proteinGoal: data.proteinGoal || proteinGoal,
        entries
      };
    });
    
    // Sort by date (newest first)
    allDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get the last 7 days (or less if not enough data)
    return allDays.slice(0, 7);
  } catch (error) {
    console.error('Error getting weekly water data:', error);
    return [];
  }
};

// Update protein amount in Firebase for egg entries
export const updateProteinAmount = async (dateKey: string, proteinAmount: number): Promise<void> => {
  try {
    const userId = getUserId();
    const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
    
    // Check if the document exists
    const q = query(
      collection(db, WATER_DATA_COLLECTION),
      where('__name__', '==', `${userId}_${dateKey}`)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Document doesn't exist, create a new one with settings
      const settings = await getUserSettings() || {
        dailyGoal: 2500,
        bottleSize: 500,
        milkGoal: 500,
        milkGlassSize: 250,
        calciumGoal: 1000,
        curdGoal: 200,
        proteinGoal: 50
      };
      
      // Create a new document with the protein amount
      await setDoc(dailyWaterRef, {
        userId,
        date: dateKey,
        totalWaterAmount: 0,
        totalMilkAmount: 0,
        totalCurdAmount: 0,
        totalCalciumAmount: 0,
        totalProteinAmount: proteinAmount,
        waterGoal: settings.dailyGoal,
        milkGoal: settings.milkGoal,
        curdGoal: settings.curdGoal,
        calciumGoal: settings.calciumGoal,
        proteinGoal: settings.proteinGoal,
        entries: [],
        updatedAt: Timestamp.now()
      });
    } else {
      // Get current data
      const dailyData = await getDailyWaterData(dateKey);
      
      if (dailyData) {
        // Update protein amount in existing document
        await updateDoc(dailyWaterRef, {
          totalProteinAmount: (dailyData.totalProteinAmount || 0) + proteinAmount,
          updatedAt: Timestamp.now()
        });
      }
    }
    
    console.log(`Updated protein amount for ${dateKey} with ${proteinAmount}g of protein`);
  } catch (error) {
    console.error('Error updating protein amount:', error);
  }
}; 