import React, { useState } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { LoadingState } from '../types';
import { LoadingOverlay } from './LoadingOverlay';
import { ResultDisplay } from './ResultDisplay';
import { Sparkles } from 'lucide-react';

export const GenerateView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading({ isLoading: true, message: 'Designing your fashion piece...' });
    setError(null);
    setResultImage(null);

    try {
      const imageUrl = await generateImageFromText(prompt, aspectRatio);
      setResultImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 relative">
        {loading.isLoading && <LoadingOverlay message={loading.message} />}
        
        <h2 className="text-2xl font-bold text-white mb-2">AI Fashion Generator</h2>
        <p className="text-slate-400 mb-6">Describe your ideal fashion photoshoot, outfit, or model.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A professional studio shot of a model wearing a futuristic silver jacket, cyberpunk street background, cinematic lighting..."
              className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
            <div className="flex gap-4">
              {['1:1', '3:4', '4:3', '16:9'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading.isLoading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            Generate Masterpiece
          </button>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <ResultDisplay imageUrl={resultImage} />
    </div>
  );
};