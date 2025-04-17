'use client';

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[var(--primary)] text-white py-4 shadow-md">
      <div className="container flex items-center justify-between">
        <h1 className="text-2xl font-bold">💧 Water Tracker</h1>
        <div className="text-sm">
          Stay hydrated, stay healthy!
        </div>
      </div>
    </header>
  );
};

export default Header; 