'use client';

import { useState } from 'react';
import { useWaterTracker } from '../context/WaterContext';
import { DEFAULT_CURD_BOWL_SIZE } from '../utils';

const AddCurd = () => {
  const { addCurd } = useWaterTracker();
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [useCustomAmount, setUseCustomAmount] = useState<boolean>(false);
  const curdBowlSize = DEFAULT_CURD_BOWL_SIZE;

  const handleAddCurd = (amount: number) => {
    addCurd(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(parseInt(e.target.value) || 0);
  };

  const handleCustomAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount > 0) {
      handleAddCurd(customAmount);
      setCustomAmount(0);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Curd</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium mb-2">Quick Add</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAddCurd(curdBowlSize / 4)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg shadow-sm transition-all"
            >
              ¼ Bowl
            </button>
            <button
              onClick={() => handleAddCurd(curdBowlSize / 2)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg shadow-sm transition-all"
            >
              ½ Bowl
            </button>
            <button
              onClick={() => handleAddCurd(curdBowlSize)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg shadow-sm transition-all"
            >
              1 Bowl
            </button>
            <button
              onClick={() => handleAddCurd(curdBowlSize * 2)}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg shadow-sm transition-all"
            >
              2 Bowls
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Custom Amount</h3>
          <div className="flex items-start space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useCustomAmount"
                checked={useCustomAmount}
                onChange={() => setUseCustomAmount(!useCustomAmount)}
                className="w-4 h-4 accent-amber-600 rounded focus:ring-amber-500"
              />
              <label
                htmlFor="useCustomAmount"
                className="ml-2 text-sm cursor-pointer"
              >
                Use custom amount
              </label>
            </div>
          </div>
          
          {useCustomAmount && (
            <form onSubmit={handleCustomAmountSubmit} className="mt-2 flex space-x-2">
              <input
                type="number"
                value={customAmount || ''}
                onChange={handleCustomAmountChange}
                placeholder="Amount in grams"
                min="1"
                className="form-input flex-1 rounded-md border-gray-600 bg-gray-700 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-all"
                disabled={customAmount <= 0}
              >
                Add
              </button>
            </form>
          )}
        </div>
        
        <p className="text-xs text-gray-400 mt-2 italic">
          One bowl of curd ({curdBowlSize}g) provides approximately 90mg of calcium
        </p>
      </div>
    </div>
  );
};

export default AddCurd; 