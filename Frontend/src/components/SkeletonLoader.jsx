import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse flex flex-col gap-4">
            <div className="w-full h-44 bg-slate-200 rounded-xl" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-72 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse flex flex-col justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="w-full h-48 bg-slate-100 rounded-xl" />
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <div key={i} className="h-16 bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};
