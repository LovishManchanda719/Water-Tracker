'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useWaterTracker } from '../context/WaterContext';
import { getToday } from '../utils';
import { WaterEntry } from '../types';

const WaterEntries: React.FC = () => {
  const { state, deleteWater } = useWaterTracker();
  const today = getToday();
  const dailyData = state.waterData[today];
  
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  
  const handleDelete = (entry: WaterEntry) => {
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
  
  if (!dailyData || dailyData.entries.length === 0) {
    return (
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Entries</h2>
        <p className="text-center py-4 text-gray-500">No water entries for today yet.</p>
      </div>
    );
  }
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Today's Entries</h2>
      
      <div className="divide-y">
        {dailyData.entries.map((entry) => (
          <div key={entry.id} className="py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{entry.amount}ml</div>
              <div className="text-xs text-gray-500">
                {format(entry.timestamp, 'h:mm a')}
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

export default WaterEntries; 