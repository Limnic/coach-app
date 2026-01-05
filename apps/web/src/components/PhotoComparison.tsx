'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  SplitSquareHorizontal,
  Layers,
} from 'lucide-react';

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  weight?: number;
  label?: string;
}

interface PhotoComparisonProps {
  photos: ProgressPhoto[];
  isOpen: boolean;
  onClose: () => void;
}

type CompareMode = 'slider' | 'sideBySide' | 'overlay';

export default function PhotoComparison({ photos, isOpen, onClose }: PhotoComparisonProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('slider');
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(photos.length - 1);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setBeforeIndex(0);
      setAfterIndex(photos.length - 1);
      setSliderPosition(50);
      setOverlayOpacity(50);
      setZoom(1);
    }
  }, [isOpen, photos.length]);

  const handleSliderDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const container = sliderRef.current;
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && compareMode === 'slider') {
      handleSliderDrag(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (compareMode === 'slider') {
      handleSliderDrag(e);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const beforePhoto = photos[beforeIndex];
  const afterPhoto = photos[afterIndex];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-display font-bold text-surface-100">Progress Comparison</h2>
            
            {/* Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-surface-800/50 rounded-lg">
              <button
                onClick={() => setCompareMode('slider')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  compareMode === 'slider'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-100'
                }`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                Slider
              </button>
              <button
                onClick={() => setCompareMode('sideBySide')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  compareMode === 'sideBySide'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-100'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                Side by Side
              </button>
              <button
                onClick={() => setCompareMode('overlay')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  compareMode === 'overlay'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                Overlay
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-800/50 rounded-lg">
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                className="p-1 hover:bg-surface-700 rounded transition-colors text-surface-400 hover:text-surface-100"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-surface-300 min-w-[4ch] text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(2, prev + 0.25))}
                className="p-1 hover:bg-surface-700 rounded transition-colors text-surface-400 hover:text-surface-100"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:bg-surface-700 rounded transition-colors text-surface-400 hover:text-surface-100"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
            >
              <X className="w-6 h-6 text-surface-400" />
            </button>
          </div>
        </div>

        {/* Main Comparison Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Slider Mode */}
          {compareMode === 'slider' && (
            <div 
              ref={sliderRef}
              className="relative h-full flex items-center justify-center overflow-hidden"
              style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
            >
              {/* After Image (Background) */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="aspect-[3/4] h-[80%] bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-800" />
                  <span className="relative z-10 text-6xl">📷</span>
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-lime-500/90 text-white text-sm font-medium">
                    After: {formatDate(afterPhoto.date)}
                  </div>
                </div>
              </div>

              {/* Before Image (Clipped) */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  transform: `scale(${zoom})`,
                }}
              >
                <div className="aspect-[3/4] h-[80%] bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-600 to-surface-700" />
                  <span className="relative z-10 text-6xl">📷</span>
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-electric-500/90 text-white text-sm font-medium">
                    Before: {formatDate(beforePhoto.date)}
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-10"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={() => setIsDragging(true)}
                onTouchMove={handleTouchMove}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <ChevronLeft className="w-4 h-4 text-surface-700" />
                    <ChevronRight className="w-4 h-4 text-surface-700" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Side by Side Mode */}
          {compareMode === 'sideBySide' && (
            <div className="h-full flex items-center justify-center gap-8 p-8">
              <div 
                className="flex-1 h-full flex flex-col items-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="px-3 py-1.5 rounded-lg bg-electric-500/90 text-white text-sm font-medium mb-4">
                  Before: {formatDate(beforePhoto.date)}
                  {beforePhoto.weight && ` • ${beforePhoto.weight}kg`}
                </div>
                <div className="aspect-[3/4] flex-1 max-h-[calc(100%-60px)] bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-600 to-surface-700" />
                  <span className="relative z-10 text-6xl">📷</span>
                </div>
              </div>
              
              <div className="w-px h-3/4 bg-surface-700" />
              
              <div 
                className="flex-1 h-full flex flex-col items-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="px-3 py-1.5 rounded-lg bg-lime-500/90 text-white text-sm font-medium mb-4">
                  After: {formatDate(afterPhoto.date)}
                  {afterPhoto.weight && ` • ${afterPhoto.weight}kg`}
                </div>
                <div className="aspect-[3/4] flex-1 max-h-[calc(100%-60px)] bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-800" />
                  <span className="relative z-10 text-6xl">📷</span>
                </div>
              </div>
            </div>
          )}

          {/* Overlay Mode */}
          {compareMode === 'overlay' && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div 
                className="relative aspect-[3/4] h-[80%]"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Before Image */}
                <div className="absolute inset-0 bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-600 to-surface-700" />
                  <span className="relative z-10 text-6xl">📷</span>
                </div>
                
                {/* After Image (Overlaid) */}
                <div 
                  className="absolute inset-0 bg-surface-800 rounded-xl flex items-center justify-center text-surface-500 overflow-hidden"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-800" />
                  <span className="relative z-10 text-6xl">📷</span>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="mt-8 flex items-center gap-4 w-full max-w-md">
                <div className="px-3 py-1 rounded bg-electric-500/90 text-white text-xs">Before</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-surface-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="px-3 py-1 rounded bg-lime-500/90 text-white text-xs">After</div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Timeline */}
        <div className="border-t border-surface-800/50 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-electric-500" />
                <span className="text-surface-400">Before</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span className="text-surface-400">After</span>
              </div>
            </div>
            <p className="text-surface-500 text-sm">
              Click to select before/after photos
            </p>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <motion.button
                key={photo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Toggle between setting before or after
                  if (index < afterIndex) {
                    setBeforeIndex(index);
                  } else {
                    setAfterIndex(index);
                  }
                }}
                className={`relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden border-2 transition-all ${
                  index === beforeIndex
                    ? 'border-electric-500 ring-2 ring-electric-500/30'
                    : index === afterIndex
                    ? 'border-lime-500 ring-2 ring-lime-500/30'
                    : 'border-surface-700 hover:border-surface-500'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-surface-600 to-surface-700 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p className="text-[10px] text-surface-300 text-center">
                    {formatDate(photo.date)}
                  </p>
                </div>
                {index === beforeIndex && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-electric-500 text-[10px] text-white font-medium">
                    Before
                  </div>
                )}
                {index === afterIndex && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-lime-500 text-[10px] text-white font-medium">
                    After
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

