import React from 'react';
import { AppMode } from '../types';
import { Wand2, Palette, Shirt } from 'lucide-react';

interface TabSelectorProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ currentMode, setMode }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <button
        onClick={() => setMode(AppMode.PREMIUM)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          currentMode === AppMode.PREMIUM
            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25 scale-105'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
      >
        <Wand2 size={20} />
        Generate
      </button>
      <button
        onClick={() => setMode(AppMode.RECOLOR)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          currentMode === AppMode.RECOLOR
            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25 scale-105'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
      >
        <Palette size={20} />
        Recolor
      </button>
      <button
        onClick={() => setMode(AppMode.TRY_ON)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          currentMode === AppMode.TRY_ON
            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25 scale-105'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
      >
        <Shirt size={20} />
        Virtual Try-On
      </button>
    </div>
  );
};