import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
      <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
      <p className="text-white font-semibold animate-pulse">{message}</p>
    </div>
  );
};