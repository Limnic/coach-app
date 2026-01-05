'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileDown,
  X,
  FileText,
  Dumbbell,
  Apple,
  TrendingUp,
  CheckSquare,
  Settings,
  RefreshCw,
  Download,
  Calendar,
  User,
} from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  email: string;
  goal: string;
}

interface ExportToPDFProps {
  athlete?: Athlete;
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'progress' | 'workout' | 'nutrition' | 'comprehensive';

const reportTypes = [
  {
    id: 'progress' as ReportType,
    label: 'Progress Report',
    description: 'Weight trends, measurements, and check-in history',
    icon: TrendingUp,
    color: 'lime',
  },
  {
    id: 'workout' as ReportType,
    label: 'Workout Plan',
    description: 'Full workout program with exercises and instructions',
    icon: Dumbbell,
    color: 'brand',
  },
  {
    id: 'nutrition' as ReportType,
    label: 'Nutrition Plan',
    description: 'Meal plan with macros, portions, and recipes',
    icon: Apple,
    color: 'electric',
  },
  {
    id: 'comprehensive' as ReportType,
    label: 'Comprehensive Report',
    description: 'Full client overview including all data',
    icon: FileText,
    color: 'coral',
  },
];

const dateRangeOptions = [
  { value: '1week', label: 'Last 7 days' },
  { value: '2weeks', label: 'Last 2 weeks' },
  { value: '1month', label: 'Last month' },
  { value: '3months', label: 'Last 3 months' },
  { value: '6months', label: 'Last 6 months' },
  { value: 'custom', label: 'Custom range' },
];

export default function ExportToPDF({ athlete, isOpen, onClose }: ExportToPDFProps) {
  const [selectedType, setSelectedType] = useState<ReportType>('progress');
  const [dateRange, setDateRange] = useState('1month');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsGenerating(false);
    setIsGenerated(true);
  };

  const handleDownload = () => {
    // In a real app, this would download the generated PDF
    // For now, simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${athlete?.name.replace(/\s+/g, '_')}_${selectedType}_report.pdf`;
    // link.click();
    
    // Reset state
    setTimeout(() => {
      setIsGenerated(false);
      onClose();
    }, 500);
  };

  const resetState = () => {
    setIsGenerated(false);
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { resetState(); onClose(); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-900 rounded-2xl border border-surface-800 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <FileDown className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-surface-100">Export to PDF</h2>
                {athlete && (
                  <p className="text-surface-500 text-sm flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {athlete.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => { resetState(); onClose(); }}
              className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {!isGenerated ? (
              <>
                {/* Report Type Selection */}
                <div>
                  <label className="label">Report Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      const colorClasses = {
                        lime: 'border-lime-500 bg-lime-500/10 text-lime-400',
                        brand: 'border-brand-500 bg-brand-500/10 text-brand-400',
                        electric: 'border-electric-500 bg-electric-500/10 text-electric-400',
                        coral: 'border-coral-500 bg-coral-500/10 text-coral-400',
                      };

                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? colorClasses[type.color as keyof typeof colorClasses]
                              : 'border-surface-700 hover:border-surface-600'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-surface-500'}`} />
                            <span className={`font-medium ${isSelected ? '' : 'text-surface-300'}`}>
                              {type.label}
                            </span>
                          </div>
                          <p className="text-xs text-surface-500">{type.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="input-field"
                  >
                    {dateRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Include in Report
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:bg-surface-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={includePhotos}
                        onChange={(e) => setIncludePhotos(e.target.checked)}
                        className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-surface-100">Progress Photos</p>
                        <p className="text-xs text-surface-500">Include before/after comparison</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:bg-surface-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                        className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-surface-100">Charts & Graphs</p>
                        <p className="text-xs text-surface-500">Weight trends, macro charts, etc.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:bg-surface-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeNotes}
                        onChange={(e) => setIncludeNotes(e.target.checked)}
                        className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-surface-100">Coach Notes</p>
                        <p className="text-xs text-surface-500">Include feedback and observations</p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckSquare className="w-10 h-10 text-lime-400" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-surface-100 mb-2">
                  PDF Ready!
                </h3>
                <p className="text-surface-500 mb-6">
                  Your report has been generated successfully
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/50 text-surface-400 text-sm">
                  <FileText className="w-4 h-4" />
                  {athlete?.name.replace(/\s+/g, '_')}_{selectedType}_report.pdf
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-surface-800 bg-surface-900/50">
            <button
              onClick={() => { resetState(); onClose(); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            {!isGenerated ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary flex-1"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </button>
            ) : (
              <button onClick={handleDownload} className="btn-primary flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

