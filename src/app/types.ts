// Types for the Water Tracker App

export enum DrinkType {
  WATER = 'water',
  MILK = 'milk',
  CURD = 'curd'
}

export interface DrinkEntry {
  id: string;
  amount: number; // in ml or g
  timestamp: Date;
  type: DrinkType;
}

export interface DailyData {
  date: string; // ISO date string
  totalWaterAmount: number; // total water ml for the day
  totalMilkAmount: number; // total milk ml for the day
  totalCurdAmount: number; // total curd g for the day
  totalCalciumAmount: number; // total calcium mg for the day
  totalProteinAmount: number; // total protein g for the day
  entries: DrinkEntry[];
  waterGoal: number; // daily water goal in ml
  milkGoal: number; // daily milk goal in ml
  curdGoal: number; // daily curd goal in g
  calciumGoal: number; // daily calcium goal in mg
  proteinGoal: number; // daily protein goal in g
}

export interface TrackerState {
  entries: DrinkEntry[];
  waterGoal: number; // default daily water goal in ml
  milkGoal: number; // default daily milk goal in ml
  curdGoal: number; // default daily curd goal in g
  calciumGoal: number; // default daily calcium goal in mg
  proteinGoal: number; // default daily protein goal in g
  data: Record<string, DailyData>; // organized by date
}

// Backward compatibility types
export type WaterEntry = DrinkEntry;
export type DailyWaterData = DailyData;
export type WaterTrackerState = TrackerState; 