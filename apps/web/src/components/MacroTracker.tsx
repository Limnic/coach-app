'use client';

import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets, Plus, ChevronRight } from 'lucide-react';
import { useNutritionStore } from '@/lib/store';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: React.ElementType;
  unit?: string;
}

function MacroRing({ label, current, target, color, icon: Icon, unit = 'g' }: MacroRingProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isOver = current > target;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            strokeWidth="8"
            fill="none"
            className="stroke-surface-800"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              stroke: isOver ? '#f43f5e' : color,
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5" style={{ color }} />
          <span className="text-lg font-bold text-surface-100">{Math.round(current)}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-surface-300">{label}</p>
        <p className="text-xs text-surface-500">
          {Math.round(current)}/{target}{unit}
        </p>
      </div>
    </div>
  );
}

interface MealLogEntry {
  id: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroTrackerProps {
  dailyTarget?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals?: {
    breakfast: MealLogEntry[];
    lunch: MealLogEntry[];
    dinner: MealLogEntry[];
    snacks: MealLogEntry[];
  };
  onAddFood?: (mealType: string) => void;
}

export default function MacroTracker({
  dailyTarget = { calories: 2000, protein: 150, carbs: 200, fat: 67 },
  meals = { breakfast: [], lunch: [], dinner: [], snacks: [] },
  onAddFood,
}: MacroTrackerProps) {
  const { totals } = useNutritionStore();

  // Calculate totals from meals
  const allEntries = [
    ...meals.breakfast,
    ...meals.lunch,
    ...meals.dinner,
    ...meals.snacks,
  ];

  const calculatedTotals = allEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const currentTotals = allEntries.length > 0 ? calculatedTotals : totals;

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', time: '7:00 AM' },
    { key: 'lunch', label: 'Lunch', time: '12:00 PM' },
    { key: 'dinner', label: 'Dinner', time: '7:00 PM' },
    { key: 'snacks', label: 'Snacks', time: 'Anytime' },
  ];

  return (
    <div className="space-y-6">
      {/* Macro Rings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-display font-semibold text-surface-100 mb-6">
          Today's Macros
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <MacroRing
            label="Calories"
            current={currentTotals.calories}
            target={dailyTarget.calories}
            color="#f97316"
            icon={Flame}
            unit="kcal"
          />
          <MacroRing
            label="Protein"
            current={currentTotals.protein}
            target={dailyTarget.protein}
            color="#f43f5e"
            icon={Beef}
          />
          <MacroRing
            label="Carbs"
            current={currentTotals.carbs}
            target={dailyTarget.carbs}
            color="#84cc16"
            icon={Wheat}
          />
          <MacroRing
            label="Fat"
            current={currentTotals.fat}
            target={dailyTarget.fat}
            color="#3b82f6"
            icon={Droplets}
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-surface-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-surface-400">Daily Progress</span>
            <span className="text-surface-100 font-medium">
              {Math.round((currentTotals.calories / dailyTarget.calories) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-surface-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((currentTotals.calories / dailyTarget.calories) * 100, 100)}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                currentTotals.calories > dailyTarget.calories
                  ? 'bg-coral-500'
                  : 'bg-gradient-to-r from-brand-500 to-lime-500'
              }`}
            />
          </div>
          <p className="text-xs text-surface-500 mt-2">
            {dailyTarget.calories - currentTotals.calories > 0
              ? `${Math.round(dailyTarget.calories - currentTotals.calories)} kcal remaining`
              : `${Math.abs(Math.round(dailyTarget.calories - currentTotals.calories))} kcal over target`}
          </p>
        </div>
      </motion.div>

      {/* Meal Logs */}
      <div className="space-y-4">
        {mealTypes.map((meal, index) => {
          const mealEntries = meals[meal.key as keyof typeof meals] || [];
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <motion.div
              key={meal.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-surface-100">{meal.label}</h4>
                  <p className="text-xs text-surface-500">{meal.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-surface-400">
                    {mealCalories} kcal
                  </span>
                  <button
                    onClick={() => onAddFood?.(meal.key)}
                    className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center hover:bg-brand-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {mealEntries.length > 0 ? (
                <div className="space-y-2">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 group hover:bg-surface-800 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-100 truncate">
                          {entry.foodName}
                        </p>
                        <p className="text-xs text-surface-500">
                          {entry.quantity}g · P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-300">
                          {entry.calories}
                        </span>
                        <ChevronRight className="w-4 h-4 text-surface-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => onAddFood?.(meal.key)}
                  className="w-full py-8 rounded-lg border-2 border-dashed border-surface-700 text-surface-500 hover:border-brand-500/50 hover:text-brand-400 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm">Add food</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4"
      >
        <h4 className="font-medium text-surface-100 mb-3">Macro Split</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-coral-500"
              style={{
                width: `${(currentTotals.protein * 4 / (currentTotals.calories || 1)) * 100}%`,
              }}
            />
            <div
              className="bg-lime-500"
              style={{
                width: `${(currentTotals.carbs * 4 / (currentTotals.calories || 1)) * 100}%`,
              }}
            />
            <div
              className="bg-electric-500"
              style={{
                width: `${(currentTotals.fat * 9 / (currentTotals.calories || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-surface-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-coral-500" />
            Protein {Math.round((currentTotals.protein * 4 / (currentTotals.calories || 1)) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            Carbs {Math.round((currentTotals.carbs * 4 / (currentTotals.calories || 1)) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-electric-500" />
            Fat {Math.round((currentTotals.fat * 9 / (currentTotals.calories || 1)) * 100)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}

