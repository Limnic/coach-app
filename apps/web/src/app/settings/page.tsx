'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { useUIStore } from '@/lib/store';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  Camera,
  Check,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { theme, setTheme, unitSystem, setUnitSystem, language, setLanguage, timezone, setTimezone } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    checkInReminders: true,
    alertNotifications: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
  };

  const handleUnitSystemChange = (system: 'metric' | 'imperial') => {
    setUnitSystem(system);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  const handleSavePreferences = () => {
    // All settings are already persisted via zustand-persist
    // Just show a success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-100">Settings</h1>
          <p className="text-surface-400">Manage your account and preferences</p>
        </div>
      </header>

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 border-l-2 border-transparent'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-400 to-lime-400 flex items-center justify-center text-surface-950 text-2xl font-bold">
                        JD
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-400 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium text-surface-100">John Doe</p>
                      <p className="text-sm text-surface-500">Elite Coach</p>
                      <button className="mt-2 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                        Change avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input type="text" defaultValue="John" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input type="text" defaultValue="Doe" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Email</label>
                      <input type="email" defaultValue="john.doe@scalefit.com" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Phone</label>
                      <input type="tel" defaultValue="+1 555-0123" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Bio</label>
                      <textarea
                        rows={3}
                        defaultValue="Certified personal trainer with 10+ years of experience helping clients achieve their fitness goals."
                        className="input-field resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button className="btn-primary">
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Email Notifications</p>
                          <p className="text-sm text-surface-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.email ? 'bg-brand-500' : 'bg-surface-700'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notifications.email ? 24 : 2 }}
                          className="w-5 h-5 rounded-full bg-white shadow"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Push Notifications</p>
                          <p className="text-sm text-surface-500">Receive push notifications</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.push ? 'bg-brand-500' : 'bg-surface-700'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notifications.push ? 24 : 2 }}
                          className="w-5 h-5 rounded-full bg-white shadow"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Check-in Reminders</p>
                          <p className="text-sm text-surface-500">Get notified about pending check-ins</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, checkInReminders: !prev.checkInReminders }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.checkInReminders ? 'bg-brand-500' : 'bg-surface-700'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notifications.checkInReminders ? 24 : 2 }}
                          className="w-5 h-5 rounded-full bg-white shadow"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Smart Alerts</p>
                          <p className="text-sm text-surface-500">Notifications for at-risk athletes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, alertNotifications: !prev.alertNotifications }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.alertNotifications ? 'bg-brand-500' : 'bg-surface-700'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notifications.alertNotifications ? 24 : 2 }}
                          className="w-5 h-5 rounded-full bg-white shadow"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Change Password</p>
                          <p className="text-sm text-surface-500">Update your password</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-surface-500" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Two-Factor Authentication</p>
                          <p className="text-sm text-surface-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <span className="badge-warning">Off</span>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-100">Download Data</p>
                          <p className="text-sm text-surface-500">Export all your data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-surface-500" />
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 border-coral-500/30">
                  <h2 className="text-lg font-semibold text-coral-400 mb-4">Danger Zone</h2>
                  <button className="flex items-center gap-3 p-4 rounded-xl bg-coral-500/10 hover:bg-coral-500/20 transition-colors text-coral-400">
                    <Trash2 className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm opacity-70">Permanently delete your account and all data</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">Current Plan</h2>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-r from-brand-500/20 to-brand-600/20 border border-brand-500/30 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-display font-bold text-surface-100">Elite Coach</p>
                        <p className="text-surface-400">Unlimited athletes, all features</p>
                      </div>
                      <span className="badge-success">Active</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-surface-100">$99</span>
                      <span className="text-surface-400">/month</span>
                    </div>
                  </div>

                  <button className="w-full btn-secondary justify-center">
                    Manage Subscription
                  </button>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">Payment Method</h2>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/30">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-surface-100">•••• •••• •••• 4242</p>
                      <p className="text-sm text-surface-500">Expires 12/25</p>
                    </div>
                    <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-surface-100 mb-6">App Preferences</h2>
                  
                  <div className="space-y-6">
                    {/* Theme Toggle */}
                    <div>
                      <label className="label">Theme</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                            theme === 'dark'
                              ? 'bg-brand-500 text-white'
                              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </button>
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                            theme === 'light'
                              ? 'bg-brand-500 text-white'
                              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </button>
                      </div>
                    </div>

                    {/* Unit System */}
                    <div>
                      <label className="label">Unit System</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUnitSystemChange('metric')}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            unitSystem === 'metric'
                              ? 'bg-brand-500 text-white'
                              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                          }`}
                        >
                          Metric (kg, cm)
                        </button>
                        <button
                          onClick={() => handleUnitSystemChange('imperial')}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            unitSystem === 'imperial'
                              ? 'bg-brand-500 text-white'
                              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                          }`}
                        >
                          Imperial (lbs, in)
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="label">Language</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'es', label: 'Español' },
                          { code: 'pt', label: 'Português' },
                          { code: 'fr', label: 'Français' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`py-3 rounded-xl font-medium transition-all ${
                              language === lang.code
                                ? 'bg-brand-500 text-white'
                                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="label">Timezone</label>
                      <select 
                        value={timezone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="input-field"
                      >
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                        <option value="UTC+0">UTC+0 (London)</option>
                        <option value="UTC+1">UTC+1 (Paris)</option>
                        <option value="UTC-3">UTC-3 (São Paulo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t border-surface-800">
                    <button 
                      onClick={handleSavePreferences}
                      className={`btn-primary ${saveSuccess ? 'bg-lime-600 hover:bg-lime-500' : ''}`}
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
