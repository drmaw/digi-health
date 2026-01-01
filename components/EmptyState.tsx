import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  return (
    <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
      <h3 className="text-xl font-black text-slate-300">{title}</h3>
      <p className="text-slate-400 font-bold mt-2">{message}</p>
    </div>
  );
};