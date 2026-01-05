'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useUIStore } from '@/lib/store';

type ThemeOption = 'dark' | 'light' | 'system';

export default function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('dark');

  useEffect(() => {
    setMounted(true);
    // Check for system preference
    const savedTheme = localStorage.getItem('scalefit-theme') as ThemeOption | null;
    if (savedTheme) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setActiveTheme('dark');
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (themeOption: ThemeOption) => {
    const html = document.documentElement;
    
    if (themeOption === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.remove('dark', 'light');
      html.classList.add(systemDark ? 'dark' : 'light');
      setTheme(systemDark ? 'dark' : 'light');
    } else {
      html.classList.remove('dark', 'light');
      html.classList.add(themeOption);
      setTheme(themeOption);
    }
    
    localStorage.setItem('scalefit-theme', themeOption);
  };

  const handleThemeChange = (themeOption: ThemeOption) => {
    setActiveTheme(themeOption);
    applyTheme(themeOption);
    setShowDropdown(false);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (activeTheme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [activeTheme]);

  if (!mounted) return null;

  const themes = [
    { id: 'light' as ThemeOption, label: 'Light', icon: Sun },
    { id: 'dark' as ThemeOption, label: 'Dark', icon: Moon },
    { id: 'system' as ThemeOption, label: 'System', icon: Monitor },
  ];

  const currentThemeIcon = activeTheme === 'light' ? Sun : activeTheme === 'dark' ? Moon : Monitor;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2.5 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-surface-600 transition-all duration-200"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            <currentThemeIcon className="w-5 h-5 text-surface-300" />
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-40 py-2 rounded-xl bg-surface-900 border border-surface-800 shadow-xl z-50"
            >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = activeTheme === themeOption.id;
                
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{themeOption.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-theme-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

