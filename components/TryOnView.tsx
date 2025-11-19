import React, { useState } from 'react';
import { virtualTryOn } from '../services/geminiService';
import { LoadingState } from '../types';
import { ImageUploader } from './ImageUploader';
import { LoadingOverlay } from './LoadingOverlay';
import { ResultDisplay } from './ResultDisplay';
import { Shirt } from 'lucide-react';

export const TryOnView: React.FC = () => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSwap = async () => {
    if (!modelFile || !productFile) return;

    setLoading({ isLoading: true, message: 'Fitting product to model...' });
    setError(null);

    try {
      const prompt = "Swap the clothing on the person in the first image with the clothing item shown in the second image.";
      
      const imageUrl = await virtualTryOn(
        modelFile, 
        productFile,
        prompt
      );
      setResultImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to swap product');
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 relative">
        {loading.isLoading && <LoadingOverlay message={loading.message} />}

        <h2 className="text-2xl font-bold text-white mb-2">Virtual Product Try-On</h2>
        <p className="text-slate-400 mb-6">Combine a model photo with a product photo to see how it looks.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ImageUploader
            label="1. Model Photo"
            onImageSelect={(f) => { setModelFile(f); setModelPreview(URL.createObjectURL(f)); }}
            selectedImage={modelFile}
            previewUrl={modelPreview}
            onClear={() => { setModelFile(null); setModelPreview(null); }}
          />
          
          <ImageUploader
            label="2. Product Photo"
            onImageSelect={(f) => { setProductFile(f); setProductPreview(URL.createObjectURL(f)); }}
            selectedImage={productFile}
            previewUrl={productPreview}
            onClear={() => { setProductFile(null); setProductPreview(null); }}
          />
        </div>

        <button
          onClick={handleSwap}
          disabled={!modelFile || !productFile || loading.isLoading}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-lg shadow-lg shadow-brand-900/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Shirt size={20} />
          Generate Try-On
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <ResultDisplay imageUrl={resultImage} />
    </div>
  );
};