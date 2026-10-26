import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-card border border-appBorder p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-full h-4 mb-1.5" />
        <Skeleton className="w-2/3 h-4 mb-4" />
      </div>
      <div className="pt-4 border-t border-appBorder flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-8 rounded-btn" />
      </div>
    </div>
  );
};
