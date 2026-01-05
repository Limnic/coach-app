'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  X,
  ChevronRight,
  Filter,
  RefreshCw,
  Clock,
  TrendingDown,
  Calendar,
  UserX,
  Scale,
  Zap,
} from 'lucide-react';

type AlertType = 'INACTIVITY' | 'WEIGHT_STAGNATION' | 'MISSED_CHECKIN' | 'GOAL_ACHIEVED' | 'PLAN_ENDING';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  athlete: {
    id: string;
    name: string;
    initials: string;
  };
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'INACTIVITY',
    severity: 'CRITICAL',
    title: 'Athlete Inactive',
    message: 'Tom Hardy has been inactive for 5 days',
    athlete: { id: '1', name: 'Tom Hardy', initials: 'TH' },
    isRead: false,
    createdAt: '2024-01-02T10:30:00',
    data: { daysInactive: 5 },
  },
  {
    id: '2',
    type: 'WEIGHT_STAGNATION',
    severity: 'WARNING',
    title: 'Weight Stagnation',
    message: 'Lisa Park\'s weight has not changed in 14 days despite weight loss goal',
    athlete: { id: '2', name: 'Lisa Park', initials: 'LP' },
    isRead: false,
    createdAt: '2024-01-02T09:15:00',
    data: { daysSinceChange: 14, currentWeight: 72.1 },
  },
  {
    id: '3',
    type: 'MISSED_CHECKIN',
    severity: 'WARNING',
    title: 'Missed Check-in',
    message: 'James Wilson missed their bi-weekly check-in deadline',
    athlete: { id: '3', name: 'James Wilson', initials: 'JW' },
    isRead: false,
    createdAt: '2024-01-01T18:00:00',
  },
  {
    id: '4',
    type: 'PLAN_ENDING',
    severity: 'INFO',
    title: 'Plan Ending Soon',
    message: 'Sarah Johnson\'s workout plan ends in 5 days',
    athlete: { id: '4', name: 'Sarah Johnson', initials: 'SJ' },
    isRead: true,
    createdAt: '2024-01-01T14:00:00',
    data: { daysRemaining: 5, planName: 'Fat Burn Pro' },
  },
  {
    id: '5',
    type: 'GOAL_ACHIEVED',
    severity: 'INFO',
    title: 'Goal Achieved! 🎉',
    message: 'Mike Chen has reached their target weight of 90kg',
    athlete: { id: '5', name: 'Mike Chen', initials: 'MC' },
    isRead: true,
    createdAt: '2023-12-31T12:00:00',
    data: { targetWeight: 90, currentWeight: 90.2 },
  },
  {
    id: '6',
    type: 'INACTIVITY',
    severity: 'WARNING',
    title: 'Decreasing Activity',
    message: 'Emma Davis has only completed 1 workout this week (target: 4)',
    athlete: { id: '6', name: 'Emma Davis', initials: 'ED' },
    isRead: true,
    createdAt: '2023-12-30T16:00:00',
    data: { workoutsCompleted: 1, target: 4 },
  },
];

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'INACTIVITY':
      return UserX;
    case 'WEIGHT_STAGNATION':
      return Scale;
    case 'MISSED_CHECKIN':
      return Calendar;
    case 'GOAL_ACHIEVED':
      return Zap;
    case 'PLAN_ENDING':
      return Clock;
    default:
      return Bell;
  }
};

const getSeverityStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-coral-500/10',
        border: 'border-coral-500/30',
        icon: 'text-coral-400',
        badge: 'badge-danger',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        badge: 'badge-warning',
      };
    case 'INFO':
      return {
        bg: 'bg-electric-500/10',
        border: 'border-electric-500/30',
        icon: 'text-electric-400',
        badge: 'badge-info',
      };
  }
};

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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = !selectedSeverity || alert.severity === selectedSeverity;
    const matchesUnread = !showUnreadOnly || !alert.isRead;
    return matchesSeverity && matchesUnread;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.isRead).length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && !a.isRead).length;

  const markAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Smart Alerts</h1>
            <p className="text-surface-400">Automated notifications for at-risk athletes</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Checks
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-ghost">
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
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
            <p className="text-sm text-surface-400 mb-1">Total Alerts</p>
            <p className="text-3xl font-bold font-display text-surface-100">{alerts.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Unread</p>
            <p className="text-3xl font-bold font-display text-brand-400">{unreadCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Critical</p>
            <p className="text-3xl font-bold font-display text-coral-400">{criticalCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Warnings</p>
            <p className="text-3xl font-bold font-display text-amber-400">{warningCount}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedSeverity(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedSeverity
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setSelectedSeverity('CRITICAL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSeverity === 'CRITICAL'
                ? 'bg-coral-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setSelectedSeverity('WARNING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSeverity === 'WARNING'
                ? 'bg-amber-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setSelectedSeverity('INFO')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSeverity === 'INFO'
                ? 'bg-electric-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            }`}
          >
            Info
          </button>
          <div className="flex-1" />
          <label className="flex items-center gap-2 text-sm text-surface-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
            />
            Unread only
          </label>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = getAlertIcon(alert.type);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card p-5 border ${styles.border} ${
                  !alert.isRead ? styles.bg : ''
                } cursor-pointer hover:border-brand-500/30 transition-all`}
                onClick={() => {
                  setSelectedAlert(alert);
                  markAsRead(alert.id);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${styles.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${!alert.isRead ? 'text-surface-100' : 'text-surface-300'}`}>
                          {alert.title}
                        </h3>
                        <span className={styles.badge}>{alert.severity}</span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <span className="text-xs text-surface-500 flex-shrink-0">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-surface-400 mb-3">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                          {alert.athlete.initials}
                        </div>
                        <span className="text-sm text-surface-300">{alert.athlete.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissAlert(alert.id);
                          }}
                          className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                        >
                          <X className="w-4 h-4 text-surface-500" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-surface-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-surface-700 mx-auto mb-4" />
              <p className="text-surface-400 text-lg">No alerts found</p>
              <p className="text-surface-500 text-sm">All caught up! Your athletes are doing great.</p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden"
            >
              {(() => {
                const styles = getSeverityStyles(selectedAlert.severity);
                const Icon = getAlertIcon(selectedAlert.type);
                return (
                  <>
                    <div className={`p-6 ${styles.bg} border-b ${styles.border}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-surface-900/50 flex items-center justify-center">
                          <Icon className={`w-7 h-7 ${styles.icon}`} />
                        </div>
                        <div>
                          <h2 className="text-xl font-display font-bold text-surface-100">
                            {selectedAlert.title}
                          </h2>
                          <span className={styles.badge}>{selectedAlert.severity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <p className="text-surface-300">{selectedAlert.message}</p>

                      <div className="glass-card p-4">
                        <h4 className="text-sm font-medium text-surface-400 mb-3">Athlete</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                            {selectedAlert.athlete.initials}
                          </div>
                          <div>
                            <p className="font-medium text-surface-100">{selectedAlert.athlete.name}</p>
                            <p className="text-sm text-surface-500">View Profile →</p>
                          </div>
                        </div>
                      </div>

                      {selectedAlert.data && (
                        <div className="glass-card p-4">
                          <h4 className="text-sm font-medium text-surface-400 mb-3">Details</h4>
                          <div className="space-y-2">
                            {Object.entries(selectedAlert.data).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-surface-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium text-surface-100">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-surface-500 text-center">
                        Triggered {formatDate(selectedAlert.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-6 border-t border-surface-800">
                      <button
                        onClick={() => setSelectedAlert(null)}
                        className="flex-1 btn-secondary"
                      >
                        Close
                      </button>
                      <button className="flex-1 btn-primary">
                        Message Athlete
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

