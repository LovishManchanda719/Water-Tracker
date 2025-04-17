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
import { DailyWaterData, WaterEntry, WaterTrackerState } from '../types';
import { formatDate } from '../utils';

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
export const saveUserSettings = async (dailyGoal: number, bottleSize: number): Promise<void> => {
  const userId = getUserId();
  const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
  
  await setDoc(settingsRef, {
    dailyGoal,
    bottleSize,
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
      goal: dailyGoal
    });
  } else {
    // Create a new document with goal if it doesn't exist
    await setDoc(dailyWaterRef, {
      userId,
      date: today,
      goal: dailyGoal,
      totalAmount: 0,
      entries: [],
      updatedAt: Timestamp.now()
    });
  }
};

// Get user settings
export const getUserSettings = async (): Promise<{ dailyGoal: number, bottleSize: number } | null> => {
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
        bottleSize: settingsData.bottleSize
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Add a water entry
export const addWaterEntry = async (entry: WaterEntry, dateKey: string): Promise<void> => {
  const userId = getUserId();
  const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
  
  // Get user settings for goal
  const settings = await getUserSettings();
  const dailyGoal = settings?.dailyGoal || 2500; // Use default if not found
  
  // Check if the document exists
  const q = query(
    collection(db, WATER_DATA_COLLECTION),
    where('__name__', '==', `${userId}_${dateKey}`)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Create a new document with the entry
    await setDoc(dailyWaterRef, {
      userId,
      date: dateKey,
      totalAmount: entry.amount,
      goal: dailyGoal,
      entries: [{
        id: entry.id,
        amount: entry.amount,
        timestamp: Timestamp.fromDate(entry.timestamp)
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
        timestamp: Timestamp.fromDate(entry.timestamp)
      }),
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    // Get current data
    const dailyData = await getDailyWaterData(dateKey);
    const currentTotal = dailyData?.totalAmount || 0;
    
    // Update the total amount
    await updateDoc(dailyWaterRef, {
      totalAmount: currentTotal + entry.amount
    });
  }
};

// Delete a water entry
export const deleteWaterEntry = async (entryId: string, dateKey: string, amount: number): Promise<void> => {
  const userId = getUserId();
  const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
  
  // Get the current daily data
  const currentData = await getDailyWaterData(dateKey);
  if (!currentData) return;
  
  // Find the entry to remove
  const entryToRemove = currentData.entries.find(e => e.id === entryId);
  if (!entryToRemove) return;
  
  // Remove the entry from the array
  await updateDoc(dailyWaterRef, {
    entries: arrayRemove({
      id: entryId,
      amount: entryToRemove.amount,
      timestamp: Timestamp.fromDate(entryToRemove.timestamp)
    })
  });
  
  // Update the total amount
  await updateDoc(dailyWaterRef, {
    totalAmount: Math.max(0, currentData.totalAmount - amount)
  });
};

// Get water data for a specific day
export const getDailyWaterData = async (dateKey: string): Promise<DailyWaterData | null> => {
  try {
    const userId = getUserId();
    const dailyWaterRef = doc(db, WATER_DATA_COLLECTION, `${userId}_${dateKey}`);
    
    // Use getDocs with a query to get the daily water document
    const q = query(
      collection(db, WATER_DATA_COLLECTION), 
      where('__name__', '==', `${userId}_${dateKey}`)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      
      // Convert Firestore timestamp to Date objects
      const entries = data.entries?.map((entry: any) => ({
        id: entry.id,
        amount: entry.amount,
        timestamp: entry.timestamp.toDate()
      })) || [];
      
      return {
        date: dateKey,
        totalAmount: data.totalAmount || 0,
        entries,
        goal: data.goal || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting daily water data:', error);
    return null;
  }
};

// Get water data for the last 7 days
export const getWeeklyWaterData = async (dailyGoal: number): Promise<DailyWaterData[]> => {
  try {
    const userId = getUserId();
    const result: DailyWaterData[] = [];
    
    // Get the last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      
      // Try to get data for this day
      const dailyData = await getDailyWaterData(dateKey);
      
      if (dailyData) {
        result.push(dailyData);
      } else {
        // Create empty data for days with no entries
        result.push({
          date: dateKey,
          totalAmount: 0,
          entries: [],
          goal: dailyGoal
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting weekly water data:', error);
    return [];
  }
}; 