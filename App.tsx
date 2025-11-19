import React, { useState } from 'react';
import { AppMode, LoadingState } from './types';
import { generateComplexFashionImage, virtualTryOn } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ResultDisplay } from './components/ResultDisplay';
import { translations } from './constants/translations';
import { 
  Layout, 
  RefreshCw, 
  Moon, 
  Sun,
  Shirt,
  Wand2,
  Crown,
  Users,
  Video,
  Glasses,
  Aperture,
  MonitorPlay,
  Image as ImageIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.PREMIUM);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State for up to 3 reference images
  const [productImg, setProductImg] = useState<File | null>(null);
  const [faceImg, setFaceImg] = useState<File | null>(null);
  const [bgImg, setBgImg] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(4);
  
  // New Settings for Model & Style
  const [bgStyle, setBgStyle] = useState('studio');
  const [is4k, setIs4k] = useState(false);
  const [isBokeh, setIsBokeh] = useState(true);
  const [glassesType, setGlassesType] = useState('none');

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });

  const t = translations[language];

  // Helper to manage file selection
  const handleFileSelect = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (file: File) => setter(file);

  const handleGenerate = async () => {
    if (!prompt && !productImg) {
      alert(language === 'id' ? "Mohon berikan prompt atau gambar produk." : "Please provide at least a prompt or a product image.");
      return;
    }

    setLoading({ isLoading: true, message: language === 'id' ? 'Sedang membuat mahakarya Anda...' : 'Generating your masterpiece...' });
    setResultImage(null);

    try {
      let imageUrl = '';
      
      // Construct enriched prompt based on settings
      let finalPrompt = prompt;
      
      // Add resolution
      if (is4k) {
        finalPrompt += ", 4k ultra hd resolution, highly detailed, sharp focus, professional photography";
      } else {
        finalPrompt += ", high quality, professional lighting";
      }

      // Add Depth of Field / Bokeh
      if (isBokeh) {
        finalPrompt += ", bokeh background, shallow depth of field, blurred background, focus on subject";
      } else {
        finalPrompt += ", deep depth of field, sharp background, everything in focus, f/8 aperture";
      }

      // Add Background Style (only if no custom bg image provided)
      if (!bgImg && bgStyle !== 'studio') {
        // Map bgStyle to descriptive text
        const bgDescriptions: Record<string, string> = {
          'urban': 'urban street city background, modern city vibe',
          'nature': 'nature background, park with trees and greenery',
          'luxury': 'luxury interior hotel lobby background, elegant atmosphere',
          'beach': 'tropical beach background, ocean view, sunlight',
          'cafe': 'cozy cafe interior background, coffee shop vibe',
          'studio': 'clean studio background' 
        };
        if (bgDescriptions[bgStyle]) {
            finalPrompt += `, ${bgDescriptions[bgStyle]}`;
        }
      }

      // Add Glasses
      if (glassesType !== 'none') {
        const glassesDesc = glassesType === 'round' ? 'round wireframe glasses' 
                          : glassesType === 'cateye' ? 'fashionable cat-eye glasses'
                          : glassesType === 'rimless' ? 'modern rimless glasses'
                          : `${glassesType} sunglasses`;
        finalPrompt += `, wearing ${glassesDesc}`;
      }

      if (mode === AppMode.TRY_ON) {
        if (!faceImg || !productImg) throw new Error(language === 'id' ? "Gambar Model dan Produk wajib diisi." : "Model/Face and Product images are required for Try-On.");
        // We append the style instructions to the try-on prompt as well
        imageUrl = await virtualTryOn(faceImg, productImg, finalPrompt);
      } else {
        // Premium / General Mode
        const images = [];
        if (productImg) images.push({ file: productImg, label: 'Product' });
        if (faceImg) images.push({ file: faceImg, label: 'Face Reference' });
        if (bgImg) images.push({ file: bgImg, label: 'Background Reference' });
        
        imageUrl = await generateComplexFashionImage(finalPrompt, images, aspectRatio);
      }

      setResultImage(imageUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  // Layout Constants
  const modes = [
    { id: AppMode.PREMIUM, label: t.modes.premium, icon: Crown },
    { id: 'PREM_PROD', label: t.modes.premiumProduct, icon: Wand2 },
    { id: 'UGC', label: t.modes.ugc, icon: Users },
    { id: AppMode.TRY_ON, label: t.modes.tryOn, icon: Shirt },
    { id: 'COUPLE', label: t.modes.couple, icon: Users },
    { id: AppMode.VIDEO_SCRIPT, label: t.modes.video, icon: Video },
  ];

  // Theme Classes
  const containerClass = isDarkMode ? 'text-white' : 'text-slate-800';
  const headerClass = isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-pink-100';
  const cardClass = isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-black/50' : 'bg-white border-brand-50 shadow-slate-900/10';
  const inputBgClass = isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-brand-50/30 border-brand-100 text-slate-700 placeholder-slate-400';
  const labelClass = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen bg-transparent font-sans transition-colors duration-300 ${containerClass}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm transition-colors duration-300 ${headerClass}`}>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase italic bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all cursor-default">
            MAS OI <span className={`not-italic inline-block transform -skew-x-12 border-b-4 border-brand-500 leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>GENERATOR</span>
          </h1>
          <p className="text-xs font-mono tracking-widest text-slate-400 mt-1 pl-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'text-slate-300 border-slate-600 hover:text-brand-400' : 'text-slate-400 border-slate-200 hover:text-brand-500'}`}>
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-colors flex gap-2 ${isDarkMode ? 'bg-slate-800 text-yellow-400 border-slate-600' : 'bg-white text-slate-400 border-slate-200'}`}
          >
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className={`flex border rounded-lg overflow-hidden ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${language === 'en' ? 'bg-brand-500 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50')}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('id')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${language === 'id' ? 'bg-brand-500 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50')}`}
            >
              ID
            </button>
          </div>
          
          <button className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-600 text-brand-400 hover:bg-slate-700' : 'bg-white border-brand-200 text-brand-600 hover:bg-brand-50'}`}>
            {t.logout}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto relative">
        {loading.isLoading && <LoadingOverlay message={loading.message} />}

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as AppMode)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                mode === m.id
                  ? 'bg-brand-500 text-white border-brand-600 shadow-md shadow-brand-200 scale-105'
                  : (isDarkMode 
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-brand-500 hover:bg-slate-700' 
                      : 'bg-white text-brand-900 border-brand-100 hover:border-brand-300 hover:bg-brand-50 shadow-sm')
              }`}
            >
              {m.icon && <m.icon size={16} />}
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Inputs & Settings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section 1: Reference & Product */}
            <div className={`rounded-2xl p-6 shadow-lg border transition-colors ${cardClass}`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-brand-900'}`}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs">1</span>
                {t.step1}
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Dynamic Input Slots based on Mode */}
                <div>
                  <ImageUploader
                    label={t.inputs.product}
                    selectedImage={productImg}
                    previewUrl={productImg ? URL.createObjectURL(productImg) : null}
                    onImageSelect={handleFileSelect(setProductImg)}
                    onClear={() => setProductImg(null)}
                    texts={t.uploader}
                  />
                </div>

                {(mode === AppMode.PREMIUM || mode === AppMode.TRY_ON) && (
                  <div className={mode === AppMode.TRY_ON ? 'col-span-2' : ''}>
                    <ImageUploader
                      label={mode === AppMode.TRY_ON ? t.inputs.modelPrompt : t.inputs.face}
                      selectedImage={faceImg}
                      previewUrl={faceImg ? URL.createObjectURL(faceImg) : null}
                      onImageSelect={handleFileSelect(setFaceImg)}
                      onClear={() => setFaceImg(null)}
                      texts={t.uploader}
                    />
                  </div>
                )}

                {mode === AppMode.PREMIUM && (
                  <ImageUploader
                    label={t.inputs.background}
                    selectedImage={bgImg}
                    previewUrl={bgImg ? URL.createObjectURL(bgImg) : null}
                    onImageSelect={handleFileSelect(setBgImg)}
                    onClear={() => setBgImg(null)}
                    texts={t.uploader}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold ${labelClass}`}>{t.inputs.promptLabel}</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.inputs.promptPlaceholder}
                  className={`w-full h-32 rounded-xl p-4 focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none resize-none transition-all text-sm ${inputBgClass}`}
                />
              </div>
            </div>

            {/* Section 2: Image Settings */}
            <div className={`rounded-2xl p-6 shadow-lg border transition-colors ${cardClass}`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-brand-900'}`}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs">2</span>
                {t.step2}
              </h2>

              <div className="mb-6">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${textMutedClass}`}>{t.settings.aspectRatio}</label>
                <div className="flex gap-2 flex-wrap">
                  {['1:1', '9:16', '16:9', '4:3', '3:4'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        aspectRatio === r
                          ? 'bg-brand-500 text-white border-brand-600'
                          : (isDarkMode 
                              ? 'bg-slate-800 text-slate-300 border-slate-600 hover:border-brand-500' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300')
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>{t.settings.numImages}</label>
                  <span className="text-brand-600 font-bold">{numImages}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                  className="w-full h-2 bg-brand-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading.isLoading}
                className={`w-full py-4 border-2 text-brand-600 font-bold rounded-xl transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm ${isDarkMode ? 'bg-slate-800 border-brand-500 hover:bg-slate-700' : 'bg-white border-brand-500 hover:bg-brand-50'}`}
              >
                {loading.isLoading ? t.settings.processing : `${t.settings.generateBtn} (${numImages} ${language === 'id' ? 'Pose' : 'Poses'})`}
              </button>
            </div>

            {/* Section 3: Model & Style (Fully Implemented) */}
            <div className={`rounded-2xl p-6 shadow-lg border transition-colors ${cardClass}`}>
              <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-brand-900'}`}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs">3</span>
                {t.step3}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Background Style */}
                <div className="col-span-1 md:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${textMutedClass}`}>
                    <ImageIcon size={14} />
                    {t.modelStyle.bgStyle}
                  </label>
                  <select
                    value={bgStyle}
                    onChange={(e) => setBgStyle(e.target.value)}
                    disabled={!!bgImg} // Disable if custom bg image is uploaded
                    className={`w-full p-3 rounded-xl border appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${inputBgClass} ${bgImg ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="studio">{t.modelStyle.options.studio}</option>
                    <option value="urban">{t.modelStyle.options.urban}</option>
                    <option value="nature">{t.modelStyle.options.nature}</option>
                    <option value="luxury">{t.modelStyle.options.luxury}</option>
                    <option value="beach">{t.modelStyle.options.beach}</option>
                    <option value="cafe">{t.modelStyle.options.cafe}</option>
                  </select>
                  {bgImg && <p className="text-xs text-brand-500 mt-1 italic">* Using custom background image</p>}
                </div>

                {/* Glasses Selector */}
                <div className="col-span-1 md:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${textMutedClass}`}>
                    <Glasses size={14} />
                    {t.modelStyle.glasses}
                  </label>
                  <select
                    value={glassesType}
                    onChange={(e) => setGlassesType(e.target.value)}
                    className={`w-full p-3 rounded-xl border appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${inputBgClass}`}
                  >
                    <option value="none">{t.modelStyle.options.none}</option>
                    <option value="aviator">{t.modelStyle.options.aviator}</option>
                    <option value="wayfarer">{t.modelStyle.options.wayfarer}</option>
                    <option value="round">{t.modelStyle.options.round}</option>
                    <option value="cateye">{t.modelStyle.options.cateye}</option>
                    <option value="sport">{t.modelStyle.options.sport}</option>
                    <option value="rimless">{t.modelStyle.options.rimless}</option>
                  </select>
                </div>

                {/* Resolution Toggle */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${textMutedClass}`}>
                    <MonitorPlay size={14} />
                    {t.modelStyle.quality}
                  </label>
                  <button
                    onClick={() => setIs4k(!is4k)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 ${
                      is4k
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                    }`}
                  >
                    {is4k ? t.modelStyle.options.k4 : t.modelStyle.options.standard}
                  </button>
                </div>

                {/* Bokeh Toggle */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${textMutedClass}`}>
                    <Aperture size={14} />
                    {t.modelStyle.effect}
                  </label>
                  <button
                    onClick={() => setIsBokeh(!isBokeh)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 ${
                      isBokeh
                        ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                    }`}
                  >
                    {isBokeh ? t.modelStyle.options.bokeh : t.modelStyle.options.clear}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`rounded-2xl p-6 shadow-lg border h-full min-h-[600px] flex flex-col transition-colors ${cardClass}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-brand-900'}`}>{t.preview.title}</h2>
                {resultImage && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {t.preview.complete}
                  </span>
                )}
              </div>
              
              <div className={`flex-1 rounded-xl border-2 border-dashed relative overflow-hidden flex items-center justify-center p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-brand-50/30 border-brand-100'}`}>
                 {resultImage ? (
                   <img src={resultImage} alt="Result" className="max-w-full max-h-[600px] object-contain shadow-lg rounded-lg" />
                 ) : (
                   <div className="text-center p-8">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-brand-100'}`}>
                       <Layout className="text-brand-400" size={40} />
                     </div>
                     <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-200' : 'text-brand-900'}`}>{t.preview.emptyTitle}</p>
                     <p className={`text-sm mt-2 max-w-xs mx-auto ${isDarkMode ? 'text-slate-400' : 'text-brand-400'}`}>{t.preview.emptyDesc}</p>
                   </div>
                 )}
              </div>

              {resultImage && (
                <div className="mt-6">
                  <ResultDisplay imageUrl={resultImage} />
                </div>
              )}
            </div>
            
            {/* Prompt Preview */}
            <div className={`rounded-2xl p-4 shadow-lg border flex justify-between items-center transition-colors ${cardClass}`}>
               <div>
                 <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-brand-900'}`}>{t.preview.promptTitle}</h3>
                 <p className={`text-xs truncate max-w-md ${textMutedClass}`}>{prompt || "No prompt entered yet..."}</p>
               </div>
               <button className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                 {t.preview.copy}
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;