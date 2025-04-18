'use client';

import React, { useState } from 'react';
import { useWaterTracker } from '../context/WaterContext';
import { PROTEIN_PER_EGG } from '../utils';

const AddEgg: React.FC = () => {
  const { addEgg } = useWaterTracker();
  const [eggCount, setEggCount] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setEggCount(value);
    }
  };
  
  const handleAddEgg = async () => {
    setIsAdding(true);
    
    try {
      await addEgg(eggCount);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Reset to default
      setEggCount(1);
    } catch (error) {
      console.error('Error adding egg:', error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="card">
      <h2 className="font-semibold text-lg mb-4">Add Egg Protein</h2>
      
      <div className="mb-4">
        <label htmlFor="eggCount" className="block mb-2 text-sm font-medium">
          Number of Eggs
        </label>
        
        <div className="flex">
          <input
            type="number"
            id="eggCount"
            className="grow p-2 border rounded mr-2"
            min="1"
            value={eggCount}
            onChange={handleCountChange}
          />
          
          <button
            onClick={handleAddEgg}
            disabled={isAdding}
            className="btn"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          {eggCount} egg{eggCount !== 1 ? 's' : ''} = {Math.round(eggCount * PROTEIN_PER_EGG)}g of protein
        </p>
      </div>
      
      {showSuccess && (
        <div className="p-2 bg-green-100 text-green-700 rounded">
          Added {eggCount} egg{eggCount !== 1 ? 's' : ''} successfully!
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-2">
        <p>1 egg provides approximately 7g of protein</p>
      </div>
    </div>
  );
};

export default AddEgg; 