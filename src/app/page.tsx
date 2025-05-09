'use client';

import React from 'react';
import Header from './components/Header';
import DailySummary from './components/DailySummary';
import AddWater from './components/AddWater';
import AddMilk from './components/AddMilk';
import AddCurd from './components/AddCurd';
import AddEgg from './components/AddEgg';
import WaterChart from './components/WaterChart';
import MilkChart from './components/MilkChart';
import ProteinChart from './components/ProteinChart';
import Settings from './components/Settings';
import DrinkEntries from './components/WaterEntries';
import LoadingSpinner from './components/LoadingSpinner';
import { WaterProvider, useWaterTracker } from './context/WaterContext';

// Main app content that depends on water tracker context
const WaterTrackerContent: React.FC = () => {
  const { isLoading } = useWaterTracker();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-6">
            <DailySummary />
            <WaterChart />
            <MilkChart />
            <ProteinChart />
          </div>
          
          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            <AddWater />
            <AddMilk />
            <AddCurd />
            <AddEgg />
            <DrinkEntries />
            <Settings />
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <div className="container">
          <p>Water & Milk Tracker App &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default function Home() {
  return (
    <WaterProvider>
      <WaterTrackerContent />
    </WaterProvider>
  );
}
