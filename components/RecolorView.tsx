import React, { useState } from 'react';
import { editImageWithPrompt, fileToBase64 } from '../services/geminiService';
import { LoadingState } from '../types';
import { ImageUploader } from './ImageUploader';
import { LoadingOverlay } from './LoadingOverlay';
import { ResultDisplay } from './ResultDisplay';
import { Palette } from 'lucide-react';

export const RecolorView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultImage(null); // Clear previous result
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultImage(null);
  };

  const handleRecolor = async () => {
    if (!selectedFile || !prompt.trim()) return;

    setLoading({ isLoading: true, message: 'Applying new colors...' });
    setError(null);

    try {
      const base64 = await fileToBase64(selectedFile);
      const imageUrl = await editImageWithPrompt(base64, prompt, selectedFile.type);
      setResultImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 relative">
        {loading.isLoading && <LoadingOverlay message={loading.message} />}

        <h2 className="text-2xl font-bold text-white mb-2">Fabric Recolor Studio</h2>
        <p className="text-slate-400 mb-6">Upload a photo and describe the color changes you want to make.</p>

        <div className="space-y-6">
          <ImageUploader
            label="Upload Original Photo"
            onImageSelect={handleImageSelect}
            selectedImage={selectedFile}
            previewUrl={previewUrl}
            onClear={handleClear}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Change the white t-shirt to neon green"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleRecolor}
            disabled={!selectedFile || !prompt.trim() || loading.isLoading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Palette size={20} />
            Apply Colors
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