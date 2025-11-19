import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface ResultDisplayProps {
  imageUrl: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl }) => {
  if (!imageUrl) return null;

  return (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-xl font-semibold text-white mb-4">Result</h3>
      <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-brand-900/50 border border-slate-700">
        <img src={imageUrl} alt="Generated Result" className="w-full h-auto max-h-[600px] object-contain bg-slate-950" />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <a
            href={imageUrl}
            download={`fashion-ai-${Date.now()}.png`}
            className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg transition-colors"
            title="Download"
          >
            <Download size={24} />
          </a>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg transition-colors"
            title="Open Fullsize"
          >
            <ExternalLink size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};