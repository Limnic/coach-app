import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function formatWeight(kg: number, system: 'metric' | 'imperial' = 'metric'): string {
  if (system === 'imperial') {
    const lbs = kg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatHeight(cm: number, system: 'metric' | 'imperial' = 'metric'): string {
  if (system === 'imperial') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Color utilities for charts and visualizations
export const chartColors = {
  primary: 'rgb(249, 115, 22)',
  primaryLight: 'rgba(249, 115, 22, 0.2)',
  lime: 'rgb(132, 204, 22)',
  limeLight: 'rgba(132, 204, 22, 0.2)',
  electric: 'rgb(59, 130, 246)',
  electricLight: 'rgba(59, 130, 246, 0.2)',
  coral: 'rgb(244, 63, 94)',
  coralLight: 'rgba(244, 63, 94, 0.2)',
};

// Goal color mapping
export function getGoalColor(goal: string): { bg: string; text: string; border: string } {
  switch (goal) {
    case 'WEIGHT_LOSS':
      return { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30' };
    case 'WEIGHT_GAIN':
      return { bg: 'bg-coral-500/20', text: 'text-coral-400', border: 'border-coral-500/30' };
    case 'BODY_RECOMP':
      return { bg: 'bg-electric-500/20', text: 'text-electric-400', border: 'border-electric-500/30' };
    default:
      return { bg: 'bg-surface-500/20', text: 'text-surface-400', border: 'border-surface-500/30' };
  }
}

// Activity level labels
export const activityLevelLabels: Record<string, string> = {
  SEDENTARY: 'Sedentary',
  LIGHTLY_ACTIVE: 'Lightly Active',
  MODERATELY_ACTIVE: 'Moderately Active',
  VERY_ACTIVE: 'Very Active',
  EXTREMELY_ACTIVE: 'Extremely Active',
};

// Goal labels
export const goalLabels: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  WEIGHT_GAIN: 'Muscle Gain',
  MAINTENANCE: 'Maintenance',
  BODY_RECOMP: 'Body Recomp',
};

