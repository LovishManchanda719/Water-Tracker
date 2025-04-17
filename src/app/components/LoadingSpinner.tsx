'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary)]"></div>
      <span className="ml-3 text-lg font-medium">Loading data...</span>
    </div>
  );
};

export default LoadingSpinner; 