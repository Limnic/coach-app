'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import WeightChart from '@/components/charts/WeightChart';
import MacroChart from '@/components/charts/MacroChart';
import WorkoutVolumeChart from '@/components/charts/WorkoutVolumeChart';
import ProgressRadar from '@/components/charts/ProgressRadar';
import ActivityHeatmap from '@/components/charts/ActivityHeatmap';
import {
  ArrowLeft,
  MessageSquare,
  ClipboardCheck,
  Dumbbell,
  Apple,
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  Scale,
  Flame,
  Edit,
  Camera,
  ChevronRight,
  FileDown,
  Images,
  Eye,
  EyeOff,
  Mail,
  Phone,
} from 'lucide-react';
import ExportToPDF from '@/components/ExportToPDF';
import PhotoComparison from '@/components/PhotoComparison';

// Mock data for athletes by ID
const mockAthletes: Record<string, any> = {
  '1': {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 555-0123',
    goal: 'Weight Loss',
    currentWeight: 68.5,
    targetWeight: 60,
    startWeight: 75,
    progress: 75,
    trend: 'down',
    lastActive: '2h ago',
    joinedAt: '2023-10-15',
    workoutPlan: 'Fat Burn Pro',
    nutritionPlan: '1600 kcal Cut',
    checkInsCompleted: 12,
    workoutsThisWeek: 4,
  },
  '2': {
    id: '2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@email.com',
    phone: '+1 555-0124',
    goal: 'Muscle Gain',
    currentWeight: 82.3,
    targetWeight: 90,
    startWeight: 78,
    progress: 60,
    trend: 'up',
    lastActive: '5h ago',
    joinedAt: '2023-09-20',
    workoutPlan: 'Hypertrophy Max',
    nutritionPlan: '3200 kcal Bulk',
    checkInsCompleted: 8,
    workoutsThisWeek: 5,
  },
  '3': {
    id: '3',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.d@email.com',
    phone: '+1 555-0125',
    goal: 'Maintenance',
    currentWeight: 58.2,
    targetWeight: 58,
    startWeight: 58,
    progress: 90,
    trend: 'stable',
    lastActive: '1d ago',
    joinedAt: '2023-08-01',
    workoutPlan: 'Strength & Tone',
    nutritionPlan: '2000 kcal Maintain',
    checkInsCompleted: 20,
    workoutsThisWeek: 3,
  },
};

// Mock weight history
const mockWeightHistory = [
  { date: '2023-10-15', weight: 75.0 },
  { date: '2023-10-22', weight: 74.2 },
  { date: '2023-10-29', weight: 73.5 },
  { date: '2023-11-05', weight: 72.8 },
  { date: '2023-11-12', weight: 72.1 },
  { date: '2023-11-19', weight: 71.5 },
  { date: '2023-11-26', weight: 70.8 },
  { date: '2023-12-03', weight: 70.2 },
  { date: '2023-12-10', weight: 69.7 },
  { date: '2023-12-17', weight: 69.1 },
  { date: '2023-12-24', weight: 68.8 },
  { date: '2024-01-01', weight: 68.5 },
];

// Mock workout volume
const mockWorkoutVolume = [
  { week: 'Week 1', volume: 12500, sessions: 4 },
  { week: 'Week 2', volume: 14200, sessions: 5 },
  { week: 'Week 3', volume: 13800, sessions: 4 },
  { week: 'Week 4', volume: 15600, sessions: 5 },
  { week: 'Week 5', volume: 16200, sessions: 5 },
  { week: 'Week 6', volume: 14900, sessions: 4 },
  { week: 'Week 7', volume: 17500, sessions: 6 },
  { week: 'Week 8', volume: 18200, sessions: 5 },
];

// Mock progress metrics
const mockProgressMetrics = [
  { metric: 'Strength', value: 75 },
  { metric: 'Endurance', value: 60 },
  { metric: 'Consistency', value: 85 },
  { metric: 'Nutrition', value: 80 },
  { metric: 'Recovery', value: 70 },
  { metric: 'Flexibility', value: 55 },
];

// Mock activity data (last 12 weeks, 7 days each)
const mockActivityData = Array.from({ length: 12 * 7 }, (_, i) => ({
  date: new Date(Date.now() - (12 * 7 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
}));

// Mock progress photos
const mockProgressPhotos = [
  { id: 'p1', url: '/placeholder', date: '2023-10-15', weight: 75.0 },
  { id: 'p2', url: '/placeholder', date: '2023-10-29', weight: 73.5 },
  { id: 'p3', url: '/placeholder', date: '2023-11-12', weight: 72.1 },
  { id: 'p4', url: '/placeholder', date: '2023-11-26', weight: 70.8 },
  { id: 'p5', url: '/placeholder', date: '2023-12-10', weight: 69.7 },
  { id: 'p6', url: '/placeholder', date: '2024-01-01', weight: 68.5 },
];

export default function AthleteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'nutrition' | 'checkins'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPhotoComparison, setShowPhotoComparison] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  // Get athlete by ID or use default
  const athleteId = typeof params.id === 'string' ? params.id : params.id?.[0] || '1';
  const athlete = mockAthletes[athleteId] || mockAthletes['1'];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'checkins', label: 'Check-ins' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/athletes" className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-surface-400" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold">
                  {athlete.firstName[0]}{athlete.lastName[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-surface-100">
                    {athlete.firstName} {athlete.lastName}
                  </h1>
                  <p className="text-surface-400">{athlete.goal} • Last active {athlete.lastActive}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Contact Info Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="btn-secondary py-2"
                >
                  {showContactInfo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  Contact
                </button>
                <AnimatePresence>
                  {showContactInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 p-4 glass-card z-50"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-surface-300">
                          <Mail className="w-4 h-4 text-surface-500" />
                          <span className="text-sm">{athlete.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-surface-300">
                          <Phone className="w-4 h-4 text-surface-500" />
                          <span className="text-sm">{athlete.phone}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => setShowPhotoComparison(true)}
                className="btn-secondary py-2"
              >
                <Images className="w-4 h-4 mr-2" />
                Photos
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="btn-secondary py-2"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                onClick={() => router.push(`/messages?athlete=${athlete.id}`)}
                className="btn-secondary"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </button>
              <button className="btn-primary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Plans
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-t-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-800/50 text-brand-400 border-b-2 border-brand-500'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-brand-400" />
                  <span className="text-surface-400 text-sm">Current Weight</span>
                </div>
                <p className="text-3xl font-bold font-display text-surface-100">
                  {athlete.currentWeight} <span className="text-lg text-surface-500">kg</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {athlete.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-lime-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-coral-400" />
                  )}
                  <span className={athlete.trend === 'down' ? 'text-lime-400' : 'text-coral-400'}>
                    {Math.abs(athlete.currentWeight - athlete.startWeight).toFixed(1)} kg
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-electric-400" />
                  <span className="text-surface-400 text-sm">Target Weight</span>
                </div>
                <p className="text-3xl font-bold font-display text-surface-100">
                  {athlete.targetWeight} <span className="text-lg text-surface-500">kg</span>
                </p>
                <p className="text-surface-500 text-sm mt-1">
                  {Math.abs(athlete.currentWeight - athlete.targetWeight).toFixed(1)} kg to go
                </p>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-5 h-5 text-lime-400" />
                  <span className="text-surface-400 text-sm">Workouts This Week</span>
                </div>
                <p className="text-3xl font-bold font-display text-surface-100">
                  {athlete.workoutsThisWeek}
                </p>
                <p className="text-surface-500 text-sm mt-1">{athlete.workoutPlan}</p>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck className="w-5 h-5 text-coral-400" />
                  <span className="text-surface-400 text-sm">Check-ins</span>
                </div>
                <p className="text-3xl font-bold font-display text-surface-100">
                  {athlete.checkInsCompleted}
                </p>
                <p className="text-surface-500 text-sm mt-1">Since {new Date(athlete.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-2 gap-6">
              <WeightChart 
                data={mockWeightHistory}
                targetWeight={athlete.targetWeight}
              />
              <MacroChart
                protein={150}
                carbs={120}
                fat={53}
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-2 gap-6">
              <WorkoutVolumeChart data={mockWorkoutVolume} />
              <ProgressRadar data={mockProgressMetrics} />
            </div>

            {/* Activity Heatmap */}
            <ActivityHeatmap data={mockActivityData} />

            {/* Current Plans */}
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold text-surface-100">Current Workout</h3>
                  <Dumbbell className="w-5 h-5 text-brand-400" />
                </div>
                <p className="text-2xl font-bold text-surface-100 mb-2">{athlete.workoutPlan}</p>
                <p className="text-surface-400 mb-4">5 days/week • Week 4 of 8</p>
                <Link href="/workouts" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
                  View Plan <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold text-surface-100">Current Nutrition</h3>
                  <Apple className="w-5 h-5 text-lime-400" />
                </div>
                <p className="text-2xl font-bold text-surface-100 mb-2">{athlete.nutritionPlan}</p>
                <div className="flex gap-4 text-sm text-surface-400 mb-4">
                  <span>P: 160g</span>
                  <span>C: 120g</span>
                  <span>F: 53g</span>
                </div>
                <Link href="/nutrition" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
                  View Plan <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'workouts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-semibold text-surface-100 mb-4">Workout History</h3>
            <p className="text-surface-400">All workout sessions will be displayed here.</p>
          </motion.div>
        )}

        {activeTab === 'nutrition' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-semibold text-surface-100 mb-4">Nutrition Log</h3>
            <p className="text-surface-400">All nutrition logs and meal tracking will be displayed here.</p>
          </motion.div>
        )}

        {activeTab === 'checkins' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-semibold text-surface-100 mb-4">Check-in History</h3>
            <p className="text-surface-400">All athlete check-ins will be displayed here.</p>
          </motion.div>
        )}
      </div>

      {/* Export to PDF Modal */}
      <ExportToPDF
        athlete={{
          id: athlete.id,
          name: `${athlete.firstName} ${athlete.lastName}`,
          email: athlete.email,
          goal: athlete.goal,
        }}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Photo Comparison */}
      <PhotoComparison
        photos={mockProgressPhotos}
        isOpen={showPhotoComparison}
        onClose={() => setShowPhotoComparison(false)}
      />
    </DashboardLayout>
  );
}
