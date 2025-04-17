'use client';

import React, { useState, useEffect } from 'react';
import { useWaterTracker } from '../context/WaterContext';

const AddWater: React.FC = () => {
  const { addWater, bottleSize } = useWaterTracker();
  const [customAmount, setCustomAmount] = useState<number>(bottleSize);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  
  // Update customAmount when bottleSize changes
  useEffect(() => {
    if (!isCustom) {
      setCustomAmount(bottleSize);
    }
  }, [bottleSize, isCustom]);
  
  const handleQuickAdd = () => {
    addWater(bottleSize);
  };
  
  const handleCustomAdd = () => {
    if (customAmount > 0) {
      addWater(customAmount);
      setIsCustom(false);
    }
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Water</h2>
      
      {!isCustom ? (
        <div className="flex flex-col gap-4">
          <button 
            className="btn btn-success flex items-center justify-center gap-2 py-3"
            onClick={handleQuickAdd}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Bottle ({bottleSize}ml)
          </button>
          
          <button 
            className="btn flex items-center justify-center gap-2"
            onClick={() => setIsCustom(true)}
          >
            Custom Amount
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="customAmount" className="text-sm mb-1">Amount (ml):</label>
            <input
              id="customAmount"
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              className="btn btn-success flex-1"
              onClick={handleCustomAdd}
            >
              Add
            </button>
            <button 
              className="btn flex-1 bg-gray-500 hover:bg-gray-600"
              onClick={() => setIsCustom(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWater; 