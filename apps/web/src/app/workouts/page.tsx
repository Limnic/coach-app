'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Filter,
  Dumbbell,
  Clock,
  Users,
  Calendar,
  ChevronRight,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  X,
  Play,
  Target,
  Zap,
  GripVertical,
} from 'lucide-react';

// Mock workout plans data
const mockWorkoutPlans = [
  {
    id: '1',
    name: 'Fat Burn Pro',
    description: 'High-intensity program for maximum fat loss',
    difficulty: 3,
    durationWeeks: 8,
    workoutsPerWeek: 5,
    assignedCount: 45,
    isTemplate: true,
    muscleGroups: ['Full Body', 'Cardio'],
    createdAt: '2023-11-01',
  },
  {
    id: '2',
    name: 'Hypertrophy Max',
    description: 'Advanced muscle building program with progressive overload',
    difficulty: 4,
    durationWeeks: 12,
    workoutsPerWeek: 6,
    assignedCount: 32,
    isTemplate: true,
    muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
    createdAt: '2023-10-15',
  },
  {
    id: '3',
    name: 'PPL Split',
    description: 'Push/Pull/Legs split for balanced muscle development',
    difficulty: 3,
    durationWeeks: 6,
    workoutsPerWeek: 6,
    assignedCount: 28,
    isTemplate: true,
    muscleGroups: ['Push', 'Pull', 'Legs'],
    createdAt: '2023-10-20',
  },
  {
    id: '4',
    name: 'Strength & Tone',
    description: 'Maintain muscle while improving definition',
    difficulty: 2,
    durationWeeks: 4,
    workoutsPerWeek: 4,
    assignedCount: 18,
    isTemplate: true,
    muscleGroups: ['Full Body', 'Core'],
    createdAt: '2023-11-10',
  },
  {
    id: '5',
    name: 'Power Building',
    description: 'Combine powerlifting with bodybuilding for strength and size',
    difficulty: 5,
    durationWeeks: 16,
    workoutsPerWeek: 5,
    assignedCount: 12,
    isTemplate: true,
    muscleGroups: ['Compound', 'Accessories'],
    createdAt: '2023-09-01',
  },
  {
    id: '6',
    name: 'Cardio Blitz',
    description: 'High-energy cardio program for endurance and fat loss',
    difficulty: 2,
    durationWeeks: 4,
    workoutsPerWeek: 5,
    assignedCount: 22,
    isTemplate: true,
    muscleGroups: ['Cardio', 'Core'],
    createdAt: '2023-11-05',
  },
];

// Mock exercises for the builder
const mockExercises = [
  { id: '1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: '2', name: 'Squat', muscle: 'Legs', equipment: 'Barbell' },
  { id: '3', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell' },
  { id: '4', name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight' },
  { id: '5', name: 'Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: '6', name: 'Bicep Curls', muscle: 'Arms', equipment: 'Dumbbell' },
  { id: '7', name: 'Tricep Dips', muscle: 'Arms', equipment: 'Bodyweight' },
  { id: '8', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine' },
];

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationWeeks: number;
  workoutsPerWeek: number;
  assignedCount: number;
  isTemplate: boolean;
  muscleGroups: string[];
  createdAt: string;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [duplicating, setDuplicating] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState(mockWorkoutPlans);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const filteredPlans = workoutPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'lime';
    if (difficulty <= 3) return 'electric';
    if (difficulty <= 4) return 'brand';
    return 'coral';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner';
    if (difficulty <= 3) return 'Intermediate';
    if (difficulty <= 4) return 'Advanced';
    return 'Expert';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Workout Plans</h1>
            <p className="text-surface-400">Create and manage workout programs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-72"
              />
            </div>
            <Link href="/workouts/builder" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Create Plan
            </Link>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Total Plans</p>
            <p className="text-3xl font-bold font-display text-surface-100">{mockWorkoutPlans.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Templates</p>
            <p className="text-3xl font-bold font-display text-electric-400">
              {mockWorkoutPlans.filter(p => p.isTemplate).length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Athletes Assigned</p>
            <p className="text-3xl font-bold font-display text-lime-400">
              {mockWorkoutPlans.reduce((sum, p) => sum + p.assignedCount, 0)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Avg. Duration</p>
            <p className="text-3xl font-bold font-display text-brand-400">
              {Math.round(mockWorkoutPlans.reduce((sum, p) => sum + p.durationWeeks, 0) / mockWorkoutPlans.length)} wks
            </p>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card overflow-hidden group hover:border-brand-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedPlan(plan)}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-surface-800/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-${getDifficultyColor(plan.difficulty)}-500/20 flex items-center justify-center`}>
                      <Dumbbell className={`w-6 h-6 text-${getDifficultyColor(plan.difficulty)}-400`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-100 group-hover:text-brand-400 transition-colors">
                        {plan.name}
                      </h3>
                      <span className={`text-xs badge-${getDifficultyColor(plan.difficulty)}`}>
                        {getDifficultyLabel(plan.difficulty)}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-surface-400" />
                  </button>
                </div>
                <p className="text-sm text-surface-400 line-clamp-2">{plan.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-surface-500 mb-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-surface-100">{plan.durationWeeks}</p>
                    <p className="text-xs text-surface-500">Weeks</p>
                  </div>
                  <div className="text-center border-x border-surface-800">
                    <div className="flex items-center justify-center gap-1 text-surface-500 mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-surface-100">{plan.workoutsPerWeek}</p>
                    <p className="text-xs text-surface-500">Days/Week</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-surface-500 mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-surface-100">{plan.assignedCount}</p>
                    <p className="text-xs text-surface-500">Athletes</p>
                  </div>
                </div>

                {/* Muscle Groups */}
                <div className="flex flex-wrap gap-2">
                  {plan.muscleGroups.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-2 py-1 text-xs rounded-lg bg-surface-800 text-surface-400"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-surface-800/30 flex items-center justify-between">
                <span className="text-xs text-surface-500">
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Copy className="w-4 h-4 text-surface-400" />
                  </button>
                  <button 
                    className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4 text-surface-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Create New Card */}
          <Link href="/workouts/builder">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filteredPlans.length * 0.05 }}
              className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-surface-700 hover:border-brand-500/50 cursor-pointer group transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-surface-800 group-hover:bg-brand-500/20 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-8 h-8 text-surface-500 group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-lg font-medium text-surface-400 group-hover:text-surface-100 transition-colors">
                Create New Plan
              </p>
              <p className="text-sm text-surface-500">Build a custom workout program</p>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Plan Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-8 bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-surface-800">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-${getDifficultyColor(selectedPlan.difficulty)}-500/20 flex items-center justify-center`}>
                    <Dumbbell className={`w-7 h-7 text-${getDifficultyColor(selectedPlan.difficulty)}-400`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-surface-100">
                      {selectedPlan.name}
                    </h2>
                    <p className="text-surface-400">{selectedPlan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/workouts/builder?id=${selectedPlan.id}`}
                    className="btn-secondary"
                    onClick={() => setSelectedPlan(null)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Plan
                  </Link>
                  <button 
                    onClick={() => setShowAssignModal(true)}
                    className="btn-primary"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Assign to Athletes
                  </button>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-surface-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Left Column - Workout Days */}
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-100 mb-4">Workout Schedule</h3>
                    {Array.from({ length: selectedPlan.workoutsPerWeek }, (_, i) => (
                      <div key={i} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-surface-100">Day {i + 1}</h4>
                          <span className="text-sm text-surface-500">
                            {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body'][i % 6]}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {mockExercises.slice(0, 4).map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 group hover:bg-surface-800 transition-colors"
                            >
                              <GripVertical className="w-4 h-4 text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                              <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
                                <Play className="w-4 h-4 text-surface-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-surface-100">{exercise.name}</p>
                                <p className="text-xs text-surface-500">
                                  {exercise.muscle} • {exercise.equipment}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-surface-300">3 × 8-12</p>
                                <p className="text-xs text-surface-500">90s rest</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column - Plan Info */}
                  <div className="space-y-4">
                    <div className="glass-card p-4">
                      <h4 className="font-medium text-surface-100 mb-4">Plan Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Duration</span>
                          <span className="font-medium text-surface-100">{selectedPlan.durationWeeks} weeks</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Frequency</span>
                          <span className="font-medium text-surface-100">{selectedPlan.workoutsPerWeek} days/week</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Difficulty</span>
                          <span className={`badge-${getDifficultyColor(selectedPlan.difficulty)}`}>
                            {getDifficultyLabel(selectedPlan.difficulty)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Athletes</span>
                          <span className="font-medium text-surface-100">{selectedPlan.assignedCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4">
                      <h4 className="font-medium text-surface-100 mb-4">Target Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlan.muscleGroups.map((muscle) => (
                          <span
                            key={muscle}
                            className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 text-sm"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-4">
                      <h4 className="font-medium text-surface-100 mb-4">Quick Actions</h4>
                      <div className="space-y-2">
                        <button 
                          onClick={async () => {
                            if (!selectedPlan) return;
                            setDuplicating(true);
                            await new Promise(r => setTimeout(r, 1000));
                            
                            // Create duplicate plan
                            const duplicatedPlan: WorkoutPlan = {
                              ...selectedPlan,
                              id: `${selectedPlan.id}-copy-${Date.now()}`,
                              name: `${selectedPlan.name} (Copy)`,
                              assignedCount: 0,
                              createdAt: new Date().toISOString().split('T')[0],
                            };
                            
                            setWorkoutPlans(prev => [...prev, duplicatedPlan]);
                            setDuplicating(false);
                            setSelectedPlan(null);
                          }}
                          disabled={duplicating}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors text-left disabled:opacity-50"
                        >
                          {duplicating ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <Copy className="w-4 h-4 text-surface-400" />
                              </motion.div>
                              <span className="text-surface-300">Duplicating...</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-surface-400" />
                              <span className="text-surface-300">Duplicate Plan</span>
                            </>
                          )}
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors text-left">
                          <Target className="w-4 h-4 text-surface-400" />
                          <span className="text-surface-300">Save as Template</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-coral-500/10 hover:bg-coral-500/20 transition-colors text-left">
                          <Trash2 className="w-4 h-4 text-coral-400" />
                          <span className="text-coral-400">Delete Plan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800">
                <h2 className="text-xl font-display font-bold text-surface-100">Create Workout Plan</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Plan Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Strength Building Program"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    placeholder="Describe the goals and focus of this plan..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duration (weeks)</label>
                    <input
                      type="number"
                      placeholder="8"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Days per Week</label>
                    <input
                      type="number"
                      placeholder="5"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Difficulty Level</label>
                  <div className="flex gap-2">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                      <button
                        key={level}
                        className="flex-1 py-2 rounded-lg bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-100 transition-colors"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-800">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <Link href="/workouts/builder" onClick={() => setShowCreateModal(false)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign to Athletes Modal */}
      <AnimatePresence>
        {showAssignModal && selectedPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-auto md:w-full md:max-w-2xl bg-surface-900 rounded-2xl border border-surface-800 z-[60] flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-100">Assign to Athletes</h2>
                  <p className="text-surface-500 text-sm">Select athletes to assign "{selectedPlan.name}"</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              
              <div className="p-4 border-b border-surface-800 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                  <input
                    type="text"
                    placeholder="Search athletes..."
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Mock athletes */}
                {[
                  { id: '1', name: 'Sarah Johnson', goal: 'Weight Loss', initials: 'SJ' },
                  { id: '2', name: 'Mike Chen', goal: 'Muscle Gain', initials: 'MC' },
                  { id: '3', name: 'Emma Davis', goal: 'Maintenance', initials: 'ED' },
                  { id: '4', name: 'James Wilson', goal: 'Weight Loss', initials: 'JW' },
                  { id: '5', name: 'Lisa Park', goal: 'Muscle Gain', initials: 'LP' },
                  { id: '6', name: 'Tom Hardy', goal: 'Strength', initials: 'TH' },
                ].map((athlete) => (
                  <label
                    key={athlete.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAthletes.includes(athlete.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAthletes(prev => [...prev, athlete.id]);
                        } else {
                          setSelectedAthletes(prev => prev.filter(id => id !== athlete.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                      {athlete.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-surface-100">{athlete.name}</p>
                      <p className="text-sm text-surface-500">{athlete.goal}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-6 border-t border-surface-800 flex-shrink-0">
                <p className="text-sm text-surface-500">{selectedAthletes.length} athlete{selectedAthletes.length !== 1 ? 's' : ''} selected</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAthletes([]);
                  }} className="btn-secondary">
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (selectedAthletes.length > 0 && selectedPlan) {
                        // Update the plan's assigned count
                        setWorkoutPlans(prev => prev.map(plan => 
                          plan.id === selectedPlan.id 
                            ? { ...plan, assignedCount: plan.assignedCount + selectedAthletes.length }
                            : plan
                        ));
                        setAssignSuccess(true);
                        setTimeout(() => {
                          setAssignSuccess(false);
                          setShowAssignModal(false);
                          setSelectedAthletes([]);
                          setSelectedPlan(null);
                        }, 1500);
                      }
                    }}
                    disabled={selectedAthletes.length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignSuccess ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          ✓
                        </motion.div>
                        <span className="ml-2">Assigned!</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Assign Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

