import React from 'react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
  </div>
);

export default LoadingSpinner;
