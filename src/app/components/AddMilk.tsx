'use client';

import React, { useState } from 'react';
import { useWaterTracker } from '../context/WaterContext';
import { DEFAULT_MILK_GLASS_SIZE } from '../utils';

const AddMilk: React.FC = () => {
  const { addMilk, milkGlassSize } = useWaterTracker();
  const [customAmount, setCustomAmount] = useState<number>(DEFAULT_MILK_GLASS_SIZE);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  
  const handleAddMilk = () => {
    if (isCustom) {
      addMilk(customAmount);
    } else {
      addMilk();
    }
  };
  
  const predefinedAmounts = [
    { label: '1 Glass (250ml)', value: 250 },
    { label: '1/2 Glass (125ml)', value: 125 },
    { label: '2 Glasses (500ml)', value: 500 },
  ];
  
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Add Milk</h2>
      
      <div className="space-y-4">
        {!isCustom && (
          <div className="grid grid-cols-3 gap-3">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount.value}
                onClick={() => addMilk(amount.value)}
                className="py-2 px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-all hover:shadow-md"
              >
                {amount.label}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="customMilkToggle"
            checked={isCustom}
            onChange={() => setIsCustom(!isCustom)}
            className="mr-2 h-4 w-4 accent-amber-500"
          />
          <label htmlFor="customMilkToggle" className="text-sm cursor-pointer">
            Custom amount
          </label>
        </div>
        
        {isCustom && (
          <div className="flex space-x-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="form-input flex-1 rounded-md border-gray-300 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Enter amount in ml"
            />
            <button
              onClick={handleAddMilk}
              className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm transition-all hover:shadow-md"
              disabled={customAmount <= 0}
            >
              Add
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2 italic">
          Each 250ml glass of milk provides 300mg of calcium.
        </div>
      </div>
    </div>
  );
};

export default AddMilk; 