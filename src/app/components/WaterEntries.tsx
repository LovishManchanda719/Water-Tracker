'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useWaterTracker } from '../context/WaterContext';
import { getToday, CALCIUM_PER_ML_MILK, CALCIUM_PER_G_CURD, PROTEIN_PER_EGG, CustomEntryType } from '../utils';
import { DrinkEntry, DrinkType } from '../types';

const DrinkEntries: React.FC = () => {
  const { state, deleteWater } = useWaterTracker();
  const today = getToday();
  const dailyData = state.data[today];
  
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  
  const handleDelete = (entry: DrinkEntry) => {
    if (showConfirm === entry.id) {
      // User confirmed deletion
      deleteWater(entry.id);
      setShowConfirm(null);
    } else {
      // Ask for confirmation
      setShowConfirm(entry.id);
    }
  };
  
  const cancelDelete = () => {
    setShowConfirm(null);
  };
  
  // Check if entry is an egg entry
  const isEggEntry = (entry: DrinkEntry) => {
    return entry.type === CustomEntryType.EGG as any;
  };
  
  // Get drink icon based on type
  const getDrinkIcon = (type: DrinkType | string) => {
    if (type === DrinkType.WATER) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.168 1.168a4 4 0 01-1.024 1.004c-.633.48-1.453.726-2.273.726-.82 0-1.64-.246-2.273-.726a4 4 0 01-1.024-1.004l1.168-1.168A3 3 0 009 8.172z" clipRule="evenodd" />
        </svg>
      );
    } else if (type === DrinkType.MILK) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
      );
    } else if (type === DrinkType.CURD) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-900" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v2a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
          <path d="M15 7v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7h10z" />
        </svg>
      );
    } else if (type === CustomEntryType.EGG) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return null;
    }
  };
  
  // Get the unit based on drink type
  const getUnit = (type: DrinkType | string) => {
    if (type === DrinkType.CURD) return 'g';
    if (type === CustomEntryType.EGG) return '';
    return 'ml';
  };
  
  // Get the calcium amount for an entry
  const getCalciumAmount = (entry: DrinkEntry) => {
    if (entry.type === DrinkType.MILK) {
      return Math.round(entry.amount * CALCIUM_PER_ML_MILK);
    } else if (entry.type === DrinkType.CURD) {
      return Math.round(entry.amount * CALCIUM_PER_G_CURD);
    }
    return 0;
  };
  
  // Get the protein amount for an entry
  const getProteinAmount = (entry: DrinkEntry) => {
    if (isEggEntry(entry)) {
      return Math.round(entry.amount * PROTEIN_PER_EGG);
    }
    return 0;
  };
  
  // Get the drink name
  const getDrinkName = (type: DrinkType | string) => {
    switch (type) {
      case DrinkType.WATER: return 'water';
      case DrinkType.MILK: return 'milk';
      case DrinkType.CURD: return 'curd';
      case CustomEntryType.EGG: return 'egg(s)';
      default: return '';
    }
  };
  
  if (!dailyData || dailyData.entries.length === 0) {
    return (
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Entries</h2>
        <p className="text-center py-4 text-gray-500">No entries for today yet.</p>
      </div>
    );
  }
  
  // Sort entries by newest first
  const sortedEntries = [...dailyData.entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Today's Entries</h2>
      
      <div className="divide-y">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-2">
                {getDrinkIcon(entry.type)}
              </div>
              <div>
                <div className="font-medium">
                  {entry.amount}{getUnit(entry.type)} 
                  <span className="text-xs ml-1 text-gray-500">
                    {getDrinkName(entry.type)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(entry.timestamp), 'h:mm a')}
                  {(entry.type === DrinkType.MILK || entry.type === DrinkType.CURD) && (
                    <span className="ml-1">
                      ({getCalciumAmount(entry)}mg calcium)
                    </span>
                  )}
                  {isEggEntry(entry) && (
                    <span className="ml-1">
                      ({getProteinAmount(entry)}g protein)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              {showConfirm === entry.id ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(entry)}
                    className="bg-[var(--danger)] hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={cancelDelete}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1 px-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleDelete(entry)}
                  className="text-[var(--danger)] hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrinkEntries; 