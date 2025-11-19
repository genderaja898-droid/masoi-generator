import React, { useRef } from 'react';
import { Upload, X, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  previewUrl: string | null;
  onClear: () => void;
  texts?: {
    upload: string;
    change: string;
  };
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  onImageSelect,
  selectedImage,
  previewUrl,
  onClear,
  texts = { upload: 'Upload Image', change: 'Change Image' }
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {selectedImage && previewUrl ? (
        <div 
          className="relative w-full aspect-square rounded-lg overflow-hidden border border-brand-200 group bg-white shadow-sm cursor-pointer"
          onClick={triggerUpload}
          title={texts.change}
        >
          <img
            src={previewUrl}
            alt="Selected"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-100 group-hover:opacity-90"
          />
          
          {/* Hover Overlay for Changing */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
             <RefreshCw className="text-white mb-1" size={24} />
             <span className="text-white text-xs font-bold uppercase tracking-wider">{texts.change}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full shadow-sm transition-colors z-10"
            title="Remove Image"
          >
            <X size={14} />
          </button>
          
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
             <p className="text-[10px] text-white text-center truncate px-2">{selectedImage.name}</p>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerUpload}
          className="w-full aspect-square bg-white/50 backdrop-blur-sm border-2 border-dashed border-brand-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:shadow-lg hover:bg-brand-50/50 transition-all group p-4"
        >
          <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-300">
             <span className="text-brand-500 font-bold text-2xl">+</span>
          </div>
          <p className="text-brand-600 font-bold text-sm text-center leading-tight">{texts.upload}</p>
          <p className="text-[10px] text-slate-400 mt-1 text-center">{label}</p>
        </div>
      )}
    </>
  );
};
