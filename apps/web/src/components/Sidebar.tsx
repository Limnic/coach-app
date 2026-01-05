'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Dumbbell,
  Apple,
  ClipboardCheck,
  Bell,
  MessageSquare,
  Library,
  Settings,
  BarChart3,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Athletes', href: '/athletes' },
  { icon: Dumbbell, label: 'Workouts', href: '/workouts' },
  { icon: Apple, label: 'Nutrition', href: '/nutrition' },
  { icon: ClipboardCheck, label: 'Check-ins', href: '/check-ins' },
  { icon: Bell, label: 'Alerts', href: '/alerts', badge: 5 },
  { icon: MessageSquare, label: 'Messages', href: '/messages', badge: 3 },
  { icon: Library, label: 'Templates', href: '/templates' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 80 : 288 }}
      className="bg-surface-900/30 backdrop-blur-xl border-r border-surface-800/50 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-surface-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-display font-bold text-surface-100">ScaleFit</h1>
              <p className="text-xs text-surface-500">Coach Dashboard</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User Profile & Theme */}
      <div className="p-4 border-t border-surface-800/50 space-y-3">
        {/* Theme Toggle */}
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <ThemeToggle />
        </div>
        
        {/* User Profile */}
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-400 to-lime-400 flex items-center justify-center text-surface-950 font-bold flex-shrink-0">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">John Doe</p>
              <p className="text-xs text-surface-500">Elite Coach</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

