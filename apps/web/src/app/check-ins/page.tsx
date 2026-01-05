'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Camera,
  MessageSquare,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Flag,
  CheckCircle,
  RefreshCw,
  Columns,
  Image,
  Maximize2,
} from 'lucide-react';
import PhotoComparison from '@/components/PhotoComparison';

// Mock data for Kanban board
const mockCheckIns = {
  pending: [
    {
      id: '1',
      athlete: { name: 'Sarah Johnson', initials: 'SJ', goal: 'Weight Loss', email: 'sarah@example.com' },
      submittedAt: '2024-01-02T10:30:00',
      weight: 68.5,
      previousWeight: 69.2,
      photos: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
      ],
      notes: 'Feeling great this week, energy levels are up! Managed to hit all my workouts and stayed on track with nutrition.',
      sleep: 7.5,
      stress: 3,
      adherence: 90,
      metrics: {
        waist: 78,
        hips: 98,
        chest: 92,
      },
    },
    {
      id: '2',
      athlete: { name: 'Mike Chen', initials: 'MC', goal: 'Muscle Gain', email: 'mike@example.com' },
      submittedAt: '2024-01-02T09:15:00',
      weight: 82.3,
      previousWeight: 81.5,
      photos: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
      ],
      notes: 'Hit a new PR on bench press! Feeling stronger every week. Appetite has been through the roof.',
      sleep: 8,
      stress: 2,
      adherence: 95,
      metrics: {
        arms: 38.5,
        chest: 105,
        shoulders: 120,
      },
    },
    {
      id: '3',
      athlete: { name: 'Emma Davis', initials: 'ED', goal: 'Maintenance', email: 'emma@example.com' },
      submittedAt: '2024-01-01T18:45:00',
      weight: 58.2,
      previousWeight: 58.0,
      photos: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
      ],
      notes: 'Holidays were tough, trying to get back on track. Missed a couple of workouts but nutrition was okay.',
      sleep: 6,
      stress: 5,
      adherence: 70,
      metrics: {
        waist: 68,
        hips: 92,
      },
    },
  ],
  flagged: [
    {
      id: '4',
      athlete: { name: 'James Wilson', initials: 'JW', goal: 'Weight Loss', email: 'james@example.com' },
      submittedAt: '2024-01-01T14:20:00',
      weight: 95.8,
      previousWeight: 93.2,
      photos: ['/api/placeholder/300/400'],
      notes: 'Struggling with cravings... Had a rough week at work and stress eating got the better of me.',
      sleep: 5,
      stress: 8,
      adherence: 45,
      flagReason: 'Weight gain of 2.6kg in 2 weeks',
      metrics: {
        waist: 102,
        hips: 108,
      },
    },
  ],
  reviewed: [
    {
      id: '5',
      athlete: { name: 'Lisa Park', initials: 'LP', goal: 'Weight Loss', email: 'lisa@example.com' },
      submittedAt: '2023-12-30T11:00:00',
      reviewedAt: '2023-12-31T09:00:00',
      weight: 72.1,
      previousWeight: 73.0,
      feedback: 'Great progress! Keep up the good work. Your consistency is paying off.',
    },
    {
      id: '6',
      athlete: { name: 'Tom Hardy', initials: 'TH', goal: 'Muscle Gain', email: 'tom@example.com' },
      submittedAt: '2023-12-29T16:30:00',
      reviewedAt: '2023-12-30T10:15:00',
      weight: 88.5,
      previousWeight: 87.8,
      feedback: 'Solid gains! Increasing calories by 200 next week to keep the momentum going.',
    },
  ],
};

const feedbackTemplates = [
  { id: '1', label: 'Great Progress', text: 'Great progress this week! Keep up the excellent work. Your dedication is showing in the results.' },
  { id: '2', label: 'Stay Consistent', text: 'Good effort! Focus on staying consistent with your nutrition and training. Small improvements add up.' },
  { id: '3', label: 'Increase Activity', text: 'Let\'s bump up the activity this week. Try adding an extra 2000 steps daily or one additional workout session.' },
  { id: '4', label: 'Rest & Recovery', text: 'Your stress levels seem high. Focus on recovery this week - prioritize sleep and consider some active recovery sessions.' },
  { id: '5', label: 'Nutrition Focus', text: 'Let\'s dial in the nutrition. Try meal prepping on Sunday to stay on track throughout the week.' },
];

type CheckIn = typeof mockCheckIns.pending[0] | typeof mockCheckIns.flagged[0];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export default function CheckInsPage() {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustPlan, setAdjustPlan] = useState(false);
  const [photoViewMode, setPhotoViewMode] = useState<'single' | 'sideBySide'>('single');
  const [showPhotoComparison, setShowPhotoComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterGoal, setFilterGoal] = useState<string | null>(null);
  const [planAdjustments, setPlanAdjustments] = useState({
    calories: 0,
    protein: 0,
    cardio: 0,
  });

  // Filter check-ins
  const filterCheckIns = (checkIns: typeof mockCheckIns.pending) => {
    return checkIns.filter(checkIn => {
      const matchesSearch = searchQuery === '' || 
        checkIn.athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkIn.athlete.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGoal = !filterGoal || checkIn.athlete.goal === filterGoal;
      return matchesSearch && matchesGoal;
    });
  };

  const filteredPending = filterCheckIns(mockCheckIns.pending);
  const filteredFlagged = filterCheckIns(mockCheckIns.flagged);

  const handleReview = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setFeedback('');
    setRating(null);
    setActivePhotoIndex(0);
    setAdjustPlan(false);
    setPlanAdjustments({ calories: 0, protein: 0, cardio: 0 });
  };

  const handleSubmitReview = async () => {
    if (!selectedCheckIn || !feedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSelectedCheckIn(null);
    // In a real app, this would update the check-in status
  };

  const applyTemplate = (template: typeof feedbackTemplates[0]) => {
    setFeedback(template.text);
  };

  const getWeightChange = (checkIn: CheckIn) => {
    if (!checkIn.previousWeight) return null;
    const change = checkIn.weight - checkIn.previousWeight;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      isPositive: (checkIn.athlete.goal === 'Muscle Gain' && change > 0) || 
                  (checkIn.athlete.goal === 'Weight Loss' && change < 0) ||
                  (checkIn.athlete.goal === 'Maintenance' && Math.abs(change) < 0.5),
    };
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Check-in Reviews</h1>
            <p className="text-surface-400">Manage and review athlete check-ins</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
              <input
                type="text"
                placeholder="Search check-ins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-64"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`btn-secondary ${filterGoal ? 'border-brand-500' : ''}`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filter
                {filterGoal && <span className="ml-2 px-2 py-0.5 rounded bg-brand-500 text-white text-xs">{filterGoal}</span>}
              </button>
              
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50"
                >
                  <button
                    onClick={() => {
                      setFilterGoal(null);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !filterGoal ? 'bg-brand-500 text-white' : 'text-surface-300 hover:bg-surface-700'
                    }`}
                  >
                    All Goals
                  </button>
                  {['Weight Loss', 'Muscle Gain', 'Maintenance'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => {
                        setFilterGoal(goal);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterGoal === goal ? 'bg-brand-500 text-white' : 'text-surface-300 hover:bg-surface-700'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {/* Pending Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="kanban-column"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-electric-400" />
              </div>
              <h3 className="font-semibold text-surface-100">Pending Review</h3>
              <span className="badge-info">{filteredPending.length}</span>
            </div>
            <div className="space-y-3">
              {filteredPending.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kanban-card"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                      {checkIn.athlete.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100">{checkIn.athlete.name}</p>
                      <p className="text-xs text-surface-500">{checkIn.athlete.goal}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Scale className="w-4 h-4" />
                      <span>{checkIn.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Camera className="w-4 h-4" />
                      <span>{checkIn.photos.length} photos</span>
                    </div>
                  </div>
                  {checkIn.notes && (
                    <p className="text-sm text-surface-400 line-clamp-2 mb-3">
                      "{checkIn.notes}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                    <span className="text-xs text-surface-500">
                      {formatDate(checkIn.submittedAt)}
                    </span>
                    <button 
                      onClick={() => handleReview(checkIn)}
                      className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors"
                    >
                      Review →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Flagged Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kanban-column"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-semibold text-surface-100">Flagged</h3>
              <span className="badge-warning">{filteredFlagged.length}</span>
            </div>
            <div className="space-y-3">
              {filteredFlagged.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kanban-card border-amber-500/30"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {checkIn.athlete.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100">{checkIn.athlete.name}</p>
                      <p className="text-xs text-surface-500">{checkIn.athlete.goal}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                    <p className="text-sm text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {checkIn.flagReason}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Scale className="w-4 h-4" />
                      <span>{checkIn.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Camera className="w-4 h-4" />
                      <span>{checkIn.photos.length} photos</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                    <span className="text-xs text-surface-500">
                      {formatDate(checkIn.submittedAt)}
                    </span>
                    <button 
                      onClick={() => handleReview(checkIn)}
                      className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
                    >
                      Review →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Reviewed Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="kanban-column"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
              </div>
              <h3 className="font-semibold text-surface-100">Reviewed</h3>
              <span className="badge-success">{mockCheckIns.reviewed.length}</span>
            </div>
            <div className="space-y-3">
              {mockCheckIns.reviewed.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kanban-card border-lime-500/20 opacity-80"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-bold text-sm">
                      {checkIn.athlete.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100">{checkIn.athlete.name}</p>
                      <p className="text-xs text-surface-500">{checkIn.athlete.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-400 mb-3">
                    <Scale className="w-4 h-4" />
                    <span>{checkIn.weight} kg</span>
                  </div>
                  {checkIn.feedback && (
                    <div className="p-2 rounded-lg bg-lime-500/10 border border-lime-500/20 mb-3">
                      <p className="text-sm text-lime-400 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {checkIn.feedback}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                    <span className="text-xs text-surface-500">
                      Reviewed {formatDate(checkIn.reviewedAt)}
                    </span>
                    <button className="text-surface-400 text-sm font-medium hover:text-surface-300 transition-colors">
                      View →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedCheckIn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCheckIn(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-4xl bg-surface-900 border-l border-surface-800 z-50 overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface-900/90 backdrop-blur-xl border-b border-surface-800 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedCheckIn(null)}
                      className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                    >
                      <X className="w-5 h-5 text-surface-400" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                        {selectedCheckIn.athlete.initials}
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-surface-100">
                          {selectedCheckIn.athlete.name}
                        </h2>
                        <p className="text-surface-500">
                          {selectedCheckIn.athlete.goal} • {selectedCheckIn.athlete.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {'flagReason' in selectedCheckIn && (
                      <span className="badge-warning flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                    <span className="text-surface-500 text-sm">
                      Submitted {formatDate(selectedCheckIn.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Weight & Metrics */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-surface-100 mb-4">Weight Progress</h3>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-4xl font-bold text-surface-100">{selectedCheckIn.weight}</p>
                        <p className="text-surface-500">kg</p>
                      </div>
                      {(() => {
                        const change = getWeightChange(selectedCheckIn);
                        if (!change) return null;
                        return (
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                            change.isPositive ? 'bg-lime-500/20 text-lime-400' : 'bg-coral-500/20 text-coral-400'
                          }`}>
                            {change.direction === 'up' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : change.direction === 'down' ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                            <span className="font-medium">{change.value} kg</span>
                          </div>
                        );
                      })()}
                    </div>
                    <p className="text-surface-500 mt-2">
                      Previous: {selectedCheckIn.previousWeight} kg
                    </p>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-surface-100 mb-4">Weekly Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-surface-400 mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Adherence</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          selectedCheckIn.adherence >= 80 ? 'text-lime-400' :
                          selectedCheckIn.adherence >= 60 ? 'text-amber-400' : 'text-coral-400'
                        }`}>
                          {selectedCheckIn.adherence}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-surface-400 mb-1">
                          <span className="text-sm">💤 Sleep</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          selectedCheckIn.sleep >= 7 ? 'text-lime-400' :
                          selectedCheckIn.sleep >= 6 ? 'text-amber-400' : 'text-coral-400'
                        }`}>
                          {selectedCheckIn.sleep}h
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-surface-400 mb-1">
                          <span className="text-sm">😰 Stress</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          selectedCheckIn.stress <= 3 ? 'text-lime-400' :
                          selectedCheckIn.stress <= 5 ? 'text-amber-400' : 'text-coral-400'
                        }`}>
                          {selectedCheckIn.stress}/10
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                {selectedCheckIn.metrics && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-surface-100 mb-4">Body Measurements</h3>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(selectedCheckIn.metrics).map(([key, value]) => (
                        <div key={key} className="px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                          <p className="text-surface-500 text-sm capitalize">{key}</p>
                          <p className="text-xl font-bold text-surface-100">{value} cm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedCheckIn.photos && selectedCheckIn.photos.length > 0 && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-surface-100">Progress Photos</h3>
                      <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-surface-800 rounded-lg">
                          <button
                            onClick={() => setPhotoViewMode('single')}
                            className={`p-1.5 rounded transition-all ${
                              photoViewMode === 'single' 
                                ? 'bg-brand-500 text-white' 
                                : 'text-surface-400 hover:text-surface-100'
                            }`}
                            title="Single View"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPhotoViewMode('sideBySide')}
                            className={`p-1.5 rounded transition-all ${
                              photoViewMode === 'sideBySide' 
                                ? 'bg-brand-500 text-white' 
                                : 'text-surface-400 hover:text-surface-100'
                            }`}
                            title="Side by Side"
                          >
                            <Columns className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Full Comparison Button */}
                        <button
                          onClick={() => setShowPhotoComparison(true)}
                          className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400 hover:text-surface-100"
                          title="Full Photo Comparison"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {photoViewMode === 'single' ? (
                      // Single Photo View
                      <div className="relative">
                        <div className="aspect-[3/4] max-w-md mx-auto rounded-xl bg-surface-800 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-surface-500">
                            <Camera className="w-16 h-16" />
                          </div>
                        </div>
                        {selectedCheckIn.photos.length > 1 && (
                          <>
                            <button
                              onClick={() => setActivePhotoIndex(prev => 
                                prev === 0 ? selectedCheckIn.photos.length - 1 : prev - 1
                              )}
                              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface-900/90 hover:bg-surface-800 transition-colors"
                            >
                              <ChevronLeft className="w-6 h-6 text-surface-300" />
                            </button>
                            <button
                              onClick={() => setActivePhotoIndex(prev => 
                                prev === selectedCheckIn.photos.length - 1 ? 0 : prev + 1
                              )}
                              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface-900/90 hover:bg-surface-800 transition-colors"
                            >
                              <ChevronRight className="w-6 h-6 text-surface-300" />
                            </button>
                          </>
                        )}
                        <div className="flex justify-center gap-2 mt-4">
                          {selectedCheckIn.photos.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === activePhotoIndex 
                                  ? 'w-8 bg-brand-500' 
                                  : 'bg-surface-600 hover:bg-surface-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Side by Side View
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCheckIn.photos.slice(0, 2).map((photo, idx) => (
                          <div key={idx} className="relative">
                            <div className="aspect-[3/4] rounded-xl bg-surface-800 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center text-surface-500">
                                <Camera className="w-12 h-12" />
                              </div>
                            </div>
                            <div className={`absolute top-2 ${idx === 0 ? 'left-2' : 'right-2'} px-2 py-1 rounded text-xs font-medium ${
                              idx === 0 ? 'bg-electric-500' : 'bg-lime-500'
                            } text-white`}>
                              {idx === 0 ? 'Before' : 'After'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedCheckIn.photos.length > 2 && photoViewMode === 'sideBySide' && (
                      <p className="text-center text-sm text-surface-500 mt-4">
                        Showing first 2 photos. <button onClick={() => setShowPhotoComparison(true)} className="text-brand-400 hover:text-brand-300">View all {selectedCheckIn.photos.length} photos</button>
                      </p>
                    )}
                  </div>
                )}

                {/* Athlete Notes */}
                {selectedCheckIn.notes && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-surface-100 mb-4">Athlete Notes</h3>
                    <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                      <p className="text-surface-300 leading-relaxed">"{selectedCheckIn.notes}"</p>
                    </div>
                  </div>
                )}

                {/* Quick Rating */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-surface-100 mb-4">Progress Rating</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setRating('positive')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        rating === 'positive'
                          ? 'border-lime-500 bg-lime-500/20'
                          : 'border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <ThumbsUp className={`w-8 h-8 mx-auto mb-2 ${
                        rating === 'positive' ? 'text-lime-400' : 'text-surface-500'
                      }`} />
                      <p className={`font-medium ${
                        rating === 'positive' ? 'text-lime-400' : 'text-surface-400'
                      }`}>On Track</p>
                    </button>
                    <button
                      onClick={() => setRating('neutral')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        rating === 'neutral'
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <Minus className={`w-8 h-8 mx-auto mb-2 ${
                        rating === 'neutral' ? 'text-amber-400' : 'text-surface-500'
                      }`} />
                      <p className={`font-medium ${
                        rating === 'neutral' ? 'text-amber-400' : 'text-surface-400'
                      }`}>Needs Work</p>
                    </button>
                    <button
                      onClick={() => setRating('negative')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        rating === 'negative'
                          ? 'border-coral-500 bg-coral-500/20'
                          : 'border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <ThumbsDown className={`w-8 h-8 mx-auto mb-2 ${
                        rating === 'negative' ? 'text-coral-400' : 'text-surface-500'
                      }`} />
                      <p className={`font-medium ${
                        rating === 'negative' ? 'text-coral-400' : 'text-surface-400'
                      }`}>Off Track</p>
                    </button>
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-surface-100 mb-4">Quick Templates</h3>
                  <div className="flex flex-wrap gap-2">
                    {feedbackTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-100 transition-colors text-sm"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-surface-100 mb-4">Your Feedback</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write personalized feedback for your athlete..."
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>

                {/* Plan Adjustments */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-surface-100">Plan Adjustments</h3>
                    <button
                      onClick={() => setAdjustPlan(!adjustPlan)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        adjustPlan
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      {adjustPlan ? 'Adjusting' : 'Make Adjustments'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {adjustPlan && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="label">Calories</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, calories: prev.calories - 100 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                -100
                              </button>
                              <input
                                type="number"
                                value={planAdjustments.calories}
                                onChange={(e) => setPlanAdjustments(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                                className="input-field text-center flex-1"
                              />
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, calories: prev.calories + 100 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                +100
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="label">Protein (g)</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, protein: prev.protein - 10 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                -10
                              </button>
                              <input
                                type="number"
                                value={planAdjustments.protein}
                                onChange={(e) => setPlanAdjustments(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                                className="input-field text-center flex-1"
                              />
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, protein: prev.protein + 10 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="label">Cardio (min/week)</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, cardio: prev.cardio - 30 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                -30
                              </button>
                              <input
                                type="number"
                                value={planAdjustments.cardio}
                                onChange={(e) => setPlanAdjustments(prev => ({ ...prev, cardio: parseInt(e.target.value) || 0 }))}
                                className="input-field text-center flex-1"
                              />
                              <button
                                onClick={() => setPlanAdjustments(prev => ({ ...prev, cardio: prev.cardio + 30 }))}
                                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                              >
                                +30
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 bg-surface-900/90 backdrop-blur-xl border-t border-surface-800 px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedCheckIn(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!feedback.trim() || isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                        </motion.div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Photo Comparison Modal */}
      {selectedCheckIn && (
        <PhotoComparison
          photos={selectedCheckIn.photos.map((url, idx) => ({
            id: `photo-${idx}`,
            url,
            date: selectedCheckIn.submittedAt,
            weight: idx === 0 ? selectedCheckIn.previousWeight : selectedCheckIn.weight,
          }))}
          isOpen={showPhotoComparison}
          onClose={() => setShowPhotoComparison(false)}
        />
      )}
    </DashboardLayout>
  );
}
