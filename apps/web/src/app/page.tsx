'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Users,
  Dumbbell,
  Apple,
  ClipboardCheck,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Target,
  Calendar,
} from 'lucide-react';

// Mock data for demonstration
const mockStats = {
  totalAthletes: 127,
  activeToday: 89,
  pendingCheckIns: 12,
  alertsCount: 5,
};

const mockAthletes = [
  { id: 1, name: 'Sarah Johnson', goal: 'Weight Loss', lastActive: '2h ago', progress: 75, trend: 'down' },
  { id: 2, name: 'Mike Chen', goal: 'Muscle Gain', lastActive: '5h ago', progress: 60, trend: 'up' },
  { id: 3, name: 'Emma Davis', goal: 'Maintenance', lastActive: '1d ago', progress: 90, trend: 'stable' },
  { id: 4, name: 'James Wilson', goal: 'Weight Loss', lastActive: '3h ago', progress: 45, trend: 'down' },
];

const mockAlerts = [
  { id: 1, type: 'critical', athlete: 'Tom Hardy', message: 'Inactive for 5 days', time: '2h ago' },
  { id: 2, type: 'warning', athlete: 'Lisa Park', message: 'Weight stagnation', time: '5h ago' },
  { id: 3, type: 'info', athlete: 'Alex Kim', message: 'Check-in overdue', time: '1d ago' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Main Content */}
        {/* Header */}
        <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-surface-100">Good Morning, John 👋</h2>
              <p className="text-surface-400">Here's what's happening with your athletes today.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search athletes..."
                  className="input-field pl-10 w-72"
                />
              </div>
              <button className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Athlete
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="stat-card group hover:border-brand-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-brand-400" />
                </div>
                <span className="badge-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
              <div className="stat-value">{mockStats.totalAthletes}</div>
              <div className="stat-label">Total Athletes</div>
            </motion.div>

            <motion.div variants={itemVariants} className="stat-card group hover:border-lime-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-lime-400" />
                </div>
                <span className="badge-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  70%
                </span>
              </div>
              <div className="stat-value">{mockStats.activeToday}</div>
              <div className="stat-label">Active Today</div>
            </motion.div>

            <motion.div variants={itemVariants} className="stat-card group hover:border-electric-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-electric-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-6 h-6 text-electric-400" />
                </div>
                <span className="badge-info">Pending</span>
              </div>
              <div className="stat-value">{mockStats.pendingCheckIns}</div>
              <div className="stat-label">Check-ins to Review</div>
            </motion.div>

            <motion.div variants={itemVariants} className="stat-card group hover:border-coral-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-coral-400" />
                </div>
                <span className="badge-danger">Action Required</span>
              </div>
              <div className="stat-value">{mockStats.alertsCount}</div>
              <div className="stat-label">Smart Alerts</div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Athletes Overview */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-surface-100">Athletes Overview</h3>
                <button className="btn-ghost text-sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {mockAthletes.map((athlete, index) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {athlete.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100 group-hover:text-brand-400 transition-colors">
                        {athlete.name}
                      </p>
                      <p className="text-sm text-surface-500">
                        {athlete.goal} · {athlete.lastActive}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-surface-500">Progress</span>
                          <span className="text-surface-300">{athlete.progress}%</span>
                        </div>
                        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                            style={{ width: `${athlete.progress}%` }}
                          />
                        </div>
                      </div>
                      {athlete.trend === 'down' && (
                        <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-lime-400" />
                        </div>
                      )}
                      {athlete.trend === 'up' && (
                        <div className="w-8 h-8 rounded-lg bg-coral-500/20 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-coral-400" />
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-surface-500 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Smart Alerts */}
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-surface-100">Smart Alerts</h3>
                <span className="badge-danger">{mockAlerts.length} Active</span>
              </div>
              <div className="space-y-4">
                {mockAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${
                      alert.type === 'critical'
                        ? 'bg-coral-500/10 border-coral-500/30'
                        : alert.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-electric-500/10 border-electric-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          alert.type === 'critical'
                            ? 'bg-coral-500/20'
                            : alert.type === 'warning'
                            ? 'bg-amber-500/20'
                            : 'bg-electric-500/20'
                        }`}
                      >
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            alert.type === 'critical'
                              ? 'text-coral-400'
                              : alert.type === 'warning'
                              ? 'text-amber-400'
                              : 'text-electric-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-100">{alert.athlete}</p>
                        <p className="text-sm text-surface-400">{alert.message}</p>
                        <p className="text-xs text-surface-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button className="w-full mt-4 btn-ghost justify-center">
                View All Alerts
              </button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-surface-100 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Dumbbell, label: 'Create Workout', color: 'brand', href: '/workouts' },
                { icon: Apple, label: 'Create Meal Plan', color: 'lime', href: '/nutrition' },
                { icon: ClipboardCheck, label: 'Review Check-ins', color: 'electric', href: '/check-ins' },
                { icon: Calendar, label: 'Schedule Session', color: 'coral', href: '/messages' },
              ].map((action, index) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:border-${action.color}-500/30 transition-all group`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                    </div>
                    <p className="font-medium text-surface-100 group-hover:text-brand-400 transition-colors">
                      {action.label}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
    </DashboardLayout>
  );
}

