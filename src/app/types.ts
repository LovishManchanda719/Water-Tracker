// Types for the Water Tracker App

export interface WaterEntry {
  id: string;
  amount: number; // in ml
  timestamp: Date;
}

export interface DailyWaterData {
  date: string; // ISO date string
  totalAmount: number; // total ml for the day
  entries: WaterEntry[];
  goal: number; // daily goal in ml
}

export interface WaterTrackerState {
  entries: WaterEntry[];
  dailyGoal: number; // default daily goal in ml
  waterData: Record<string, DailyWaterData>; // organized by date
} 