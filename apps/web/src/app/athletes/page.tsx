'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Phone,
  Calendar,
  Target,
  Dumbbell,
  Apple,
  Scale,
  Activity,
  X,
  MoreVertical,
  MessageSquare,
  ClipboardCheck,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';

// Mock data
const mockAthletes = [
  {
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
    avatar: null,
  },
  {
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
    avatar: null,
  },
  {
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
    avatar: null,
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.w@email.com',
    phone: '+1 555-0126',
    goal: 'Weight Loss',
    currentWeight: 95.8,
    targetWeight: 80,
    startWeight: 105,
    progress: 45,
    trend: 'down',
    lastActive: '3h ago',
    joinedAt: '2023-11-01',
    workoutPlan: 'Cardio Blitz',
    nutritionPlan: '1800 kcal Cut',
    checkInsCompleted: 6,
    workoutsThisWeek: 2,
    avatar: null,
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Park',
    email: 'lisa.park@email.com',
    phone: '+1 555-0127',
    goal: 'Body Recomp',
    currentWeight: 65.0,
    targetWeight: 62,
    startWeight: 68,
    progress: 55,
    trend: 'down',
    lastActive: '6h ago',
    joinedAt: '2023-10-01',
    workoutPlan: 'PPL Split',
    nutritionPlan: '1900 kcal Recomp',
    checkInsCompleted: 10,
    workoutsThisWeek: 4,
    avatar: null,
  },
  {
    id: '6',
    firstName: 'Tom',
    lastName: 'Hardy',
    email: 'tom.h@email.com',
    phone: '+1 555-0128',
    goal: 'Muscle Gain',
    currentWeight: 88.5,
    targetWeight: 95,
    startWeight: 85,
    progress: 35,
    trend: 'up',
    lastActive: '5d ago',
    joinedAt: '2023-11-15',
    workoutPlan: 'Power Building',
    nutritionPlan: '3500 kcal Bulk',
    checkInsCompleted: 4,
    workoutsThisWeek: 1,
    avatar: null,
  },
];

const goalColors: Record<string, string> = {
  'Weight Loss': 'lime',
  'Muscle Gain': 'electric',
  'Maintenance': 'brand',
  'Body Recomp': 'coral',
};

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  goal: string;
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  progress: number;
  trend: string;
  lastActive: string;
  joinedAt: string;
  workoutPlan: string;
  nutritionPlan: string;
  checkInsCompleted: number;
  workoutsThisWeek: number;
  avatar: string | null;
}

export default function AthletesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const filteredAthletes = mockAthletes.filter((athlete) => {
    const matchesSearch =
      athlete.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = !selectedGoal || athlete.goal === selectedGoal;
    return matchesSearch && matchesGoal;
  });

  const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Body Recomp'];

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Athletes</h1>
            <p className="text-surface-400">Manage and monitor your athletes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
              <input
                type="text"
                placeholder="Search athletes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-72"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Athlete
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedGoal(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedGoal
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            All Athletes
          </button>
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => setSelectedGoal(goal === selectedGoal ? null : goal)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGoal === goal
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Total Athletes</p>
            <p className="text-3xl font-bold font-display text-surface-100">{mockAthletes.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Active This Week</p>
            <p className="text-3xl font-bold font-display text-lime-400">
              {mockAthletes.filter((a) => !a.lastActive.includes('d')).length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Avg. Progress</p>
            <p className="text-3xl font-bold font-display text-electric-400">
              {Math.round(mockAthletes.reduce((sum, a) => sum + a.progress, 0) / mockAthletes.length)}%
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Needing Attention</p>
            <p className="text-3xl font-bold font-display text-coral-400">
              {mockAthletes.filter((a) => a.lastActive.includes('d')).length}
            </p>
          </motion.div>
        </div>

        {/* Athletes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAthletes.map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedAthlete(athlete)}
              className="glass-card p-5 cursor-pointer hover:border-brand-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {athlete.firstName[0]}{athlete.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-100 group-hover:text-brand-400 transition-colors">
                      {athlete.firstName} {athlete.lastName}
                    </h3>
                    <p className="text-sm text-surface-500">Active {athlete.lastActive}</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all">
                  <MoreVertical className="w-4 h-4 text-surface-400" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`badge-${goalColors[athlete.goal] || 'info'}`}>
                  {athlete.goal}
                </span>
                <span className="text-xs text-surface-500">• {athlete.lastActive}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-surface-400">Progress</span>
                    <div className="flex items-center gap-2">
                      <span className="text-surface-100 font-medium">{athlete.progress}%</span>
                      {athlete.trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-lime-400" />
                      )}
                      {athlete.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-electric-400" />
                      )}
                      {athlete.trend === 'stable' && (
                        <Minus className="w-4 h-4 text-surface-400" />
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${athlete.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-400">{athlete.currentWeight} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-400">{athlete.targetWeight} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Dumbbell className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-400">{athlete.workoutsThisWeek}/wk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClipboardCheck className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-400">{athlete.checkInsCompleted} check-ins</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-surface-400 text-lg">No athletes found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Athlete Detail Slide-over */}
      <AnimatePresence>
        {selectedAthlete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAthlete(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[500px] bg-surface-900 border-l border-surface-800 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedAthlete.firstName[0]}{selectedAthlete.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-surface-100">
                        {selectedAthlete.firstName} {selectedAthlete.lastName}
                      </h2>
                      <p className="text-surface-400">{selectedAthlete.goal}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAthlete(null)}
                    className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-surface-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedAthlete(null);
                      router.push(`/athletes/${selectedAthlete.id}`);
                    }}
                    className="flex-1 btn-primary py-3"
                  >
                    View Full Profile
                  </button>
                  <button 
                    onClick={() => {
                      const athleteId = selectedAthlete.id;
                      setSelectedAthlete(null);
                      router.push(`/messages?athlete=${athleteId}`);
                    }}
                    className="flex-1 btn-secondary py-3"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </button>
                </div>

                {/* Contact Info */}
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-surface-100">Contact Information</h3>
                    <button 
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-400"
                    >
                      {showContactInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {showContactInfo ? (
                    <>
                      <div className="flex items-center gap-3 text-surface-300">
                        <Mail className="w-4 h-4 text-surface-500" />
                        {selectedAthlete.email}
                      </div>
                      <div className="flex items-center gap-3 text-surface-300">
                        <Phone className="w-4 h-4 text-surface-500" />
                        {selectedAthlete.phone}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-surface-500">Click the eye icon to reveal contact details</p>
                  )}
                  <div className="flex items-center gap-3 text-surface-300 pt-2 border-t border-surface-700">
                    <Calendar className="w-4 h-4 text-surface-500" />
                    Joined {new Date(selectedAthlete.joinedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Weight Progress */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-surface-100 mb-4">Weight Progress</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-surface-100">{selectedAthlete.startWeight}</p>
                      <p className="text-xs text-surface-500">Start</p>
                    </div>
                    <div className="flex-1 mx-4 relative h-2 bg-surface-800 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAthlete.progress}%` }}
                        className="absolute h-full bg-gradient-to-r from-brand-500 to-lime-500 rounded-full"
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-500 shadow-lg"
                        style={{ left: `calc(${selectedAthlete.progress}% - 8px)` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-lime-400">{selectedAthlete.targetWeight}</p>
                      <p className="text-xs text-surface-500">Goal</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-surface-400">Current:</span>
                    <span className="font-bold text-surface-100">{selectedAthlete.currentWeight} kg</span>
                    {selectedAthlete.trend === 'down' && (
                      <span className="flex items-center text-lime-400 text-sm">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Losing
                      </span>
                    )}
                    {selectedAthlete.trend === 'up' && (
                      <span className="flex items-center text-electric-400 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Gaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Plans */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-surface-100 mb-4">Current Plans</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-electric-500/20 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-electric-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-100">{selectedAthlete.workoutPlan}</p>
                          <p className="text-xs text-surface-500">Workout Plan</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-surface-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                          <Apple className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-100">{selectedAthlete.nutritionPlan}</p>
                          <p className="text-xs text-surface-500">Nutrition Plan</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-surface-500" />
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-surface-100 mb-4">This Week's Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-surface-800/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Dumbbell className="w-5 h-5 text-electric-400" />
                      </div>
                      <p className="text-2xl font-bold text-surface-100">{selectedAthlete.workoutsThisWeek}</p>
                      <p className="text-xs text-surface-500">Workouts</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-surface-800/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ClipboardCheck className="w-5 h-5 text-lime-400" />
                      </div>
                      <p className="text-2xl font-bold text-surface-100">{selectedAthlete.checkInsCompleted}</p>
                      <p className="text-xs text-surface-500">Total Check-ins</p>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-center gap-2 text-sm text-surface-500">
                  <Activity className="w-4 h-4" />
                  Last active {selectedAthlete.lastActive}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

