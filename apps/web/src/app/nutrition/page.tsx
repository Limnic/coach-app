'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Apple,
  Utensils,
  Calculator,
  Users,
  ChevronRight,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  X,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';

// Mock nutrition plans
const mockNutritionPlans = [
  {
    id: '1',
    name: '1600 kcal Cut',
    description: 'Low calorie plan for aggressive fat loss',
    dailyCalories: 1600,
    proteinGrams: 160,
    carbGrams: 120,
    fatGrams: 53,
    mealsPerDay: 4,
    assignedCount: 18,
    isTemplate: true,
    createdAt: '2023-11-01',
  },
  {
    id: '2',
    name: '3200 kcal Bulk',
    description: 'High calorie plan for muscle building',
    dailyCalories: 3200,
    proteinGrams: 200,
    carbGrams: 400,
    fatGrams: 89,
    mealsPerDay: 5,
    assignedCount: 14,
    isTemplate: true,
    createdAt: '2023-10-15',
  },
  {
    id: '3',
    name: '2000 kcal Maintain',
    description: 'Balanced plan for weight maintenance',
    dailyCalories: 2000,
    proteinGrams: 150,
    carbGrams: 200,
    fatGrams: 67,
    mealsPerDay: 4,
    assignedCount: 22,
    isTemplate: true,
    createdAt: '2023-10-20',
  },
  {
    id: '4',
    name: '1900 kcal Recomp',
    description: 'Moderate deficit with high protein for body recomposition',
    dailyCalories: 1900,
    proteinGrams: 190,
    carbGrams: 150,
    fatGrams: 63,
    mealsPerDay: 4,
    assignedCount: 16,
    isTemplate: true,
    createdAt: '2023-11-10',
  },
  {
    id: '5',
    name: '1800 kcal Cut',
    description: 'Moderate deficit for sustainable fat loss',
    dailyCalories: 1800,
    proteinGrams: 170,
    carbGrams: 140,
    fatGrams: 60,
    mealsPerDay: 4,
    assignedCount: 24,
    isTemplate: true,
    createdAt: '2023-09-01',
  },
  {
    id: '6',
    name: '3500 kcal Bulk',
    description: 'Aggressive bulking plan for hard gainers',
    dailyCalories: 3500,
    proteinGrams: 220,
    carbGrams: 450,
    fatGrams: 97,
    mealsPerDay: 6,
    assignedCount: 8,
    isTemplate: true,
    createdAt: '2023-11-05',
  },
];

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  mealsPerDay: number;
  assignedCount: number;
  isTemplate: boolean;
  createdAt: string;
}

// Mock meal data for preview
const mockMeals: Record<string, { name: string; time: string; foods: { name: string; amount: string; calories: number; protein: number; carbs: number; fat: number }[] }[]> = {
  '1': [
    { name: 'Breakfast', time: '7:00 AM', foods: [
      { name: 'Scrambled Eggs', amount: '3 large', calories: 210, protein: 18, carbs: 2, fat: 15 },
      { name: 'Whole Wheat Toast', amount: '1 slice', calories: 80, protein: 4, carbs: 15, fat: 1 },
      { name: 'Greek Yogurt', amount: '150g', calories: 100, protein: 15, carbs: 6, fat: 2 },
    ]},
    { name: 'Lunch', time: '12:00 PM', foods: [
      { name: 'Grilled Chicken Breast', amount: '150g', calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: 'Brown Rice', amount: '100g', calories: 112, protein: 3, carbs: 24, fat: 1 },
      { name: 'Steamed Broccoli', amount: '100g', calories: 34, protein: 3, carbs: 7, fat: 0 },
    ]},
    { name: 'Snack', time: '3:30 PM', foods: [
      { name: 'Protein Shake', amount: '1 scoop', calories: 120, protein: 24, carbs: 3, fat: 2 },
      { name: 'Apple', amount: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
    ]},
    { name: 'Dinner', time: '7:00 PM', foods: [
      { name: 'Salmon Fillet', amount: '150g', calories: 280, protein: 30, carbs: 0, fat: 18 },
      { name: 'Sweet Potato', amount: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
      { name: 'Mixed Salad', amount: '100g', calories: 25, protein: 1, carbs: 5, fat: 0 },
    ]},
  ],
};

export default function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [nutritionPlans, setNutritionPlans] = useState(mockNutritionPlans);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [assignSuccess, setAssignSuccess] = useState(false);
  
  // TDEE Calculator state
  const [tdeeForm, setTdeeForm] = useState({
    weight: 70,
    height: 175,
    age: 30,
    gender: 'male' as 'male' | 'female',
    activity: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'lose' as 'lose' | 'maintain' | 'gain',
  });
  
  // Calculate TDEE
  const calculateTDEE = () => {
    const { weight, height, age, gender, activity, goal } = tdeeForm;
    
    // Mifflin-St Jeor Equation for BMR
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const tdee = Math.round(bmr * activityMultipliers[activity]);
    
    // Adjust for goal
    let targetCalories: number;
    if (goal === 'lose') {
      targetCalories = Math.round(tdee * 0.8); // 20% deficit
    } else if (goal === 'gain') {
      targetCalories = Math.round(tdee * 1.15); // 15% surplus
    } else {
      targetCalories = tdee;
    }
    
    // Calculate macros based on goal
    const proteinPerKg = goal === 'lose' ? 2.2 : goal === 'gain' ? 2.0 : 1.8;
    const protein = Math.round(weight * proteinPerKg);
    const proteinCals = protein * 4;
    
    const fatPercent = 0.25;
    const fat = Math.round((targetCalories * fatPercent) / 9);
    const fatCals = fat * 9;
    
    const carbCals = targetCalories - proteinCals - fatCals;
    const carbs = Math.round(carbCals / 4);
    
    return { tdee, targetCalories, protein, carbs, fat };
  };
  
  const tdeeResults = calculateTDEE();

  const filteredPlans = mockNutritionPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMacroPercentage = (plan: NutritionPlan) => {
    const totalCals = plan.proteinGrams * 4 + plan.carbGrams * 4 + plan.fatGrams * 9;
    return {
      protein: Math.round((plan.proteinGrams * 4 / totalCals) * 100),
      carbs: Math.round((plan.carbGrams * 4 / totalCals) * 100),
      fat: Math.round((plan.fatGrams * 9 / totalCals) * 100),
    };
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Nutrition Plans</h1>
            <p className="text-surface-400">Create and manage meal plans for your athletes</p>
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
            <Link href="/nutrition/grocery-list" className="btn-secondary">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Grocery List
            </Link>
            <button
              onClick={() => setShowCalculator(true)}
              className="btn-secondary"
            >
              <Calculator className="w-5 h-5 mr-2" />
              TDEE Calculator
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Plan
            </button>
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
            <p className="text-3xl font-bold font-display text-surface-100">{mockNutritionPlans.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Athletes Assigned</p>
            <p className="text-3xl font-bold font-display text-lime-400">
              {mockNutritionPlans.reduce((sum, p) => sum + p.assignedCount, 0)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Avg. Calories</p>
            <p className="text-3xl font-bold font-display text-brand-400">
              {Math.round(mockNutritionPlans.reduce((sum, p) => sum + p.dailyCalories, 0) / mockNutritionPlans.length)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-surface-400 mb-1">Avg. Protein</p>
            <p className="text-3xl font-bold font-display text-coral-400">
              {Math.round(mockNutritionPlans.reduce((sum, p) => sum + p.proteinGrams, 0) / mockNutritionPlans.length)}g
            </p>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => {
            const macros = getMacroPercentage(plan);
            return (
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
                      <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center">
                        <Apple className="w-6 h-6 text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-100 group-hover:text-brand-400 transition-colors">
                          {plan.name}
                        </h3>
                        <span className="text-sm text-surface-500">{plan.mealsPerDay} meals/day</span>
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

                {/* Calories & Macros */}
                <div className="p-5">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-brand-400" />
                    <span className="text-3xl font-bold font-display text-surface-100">
                      {plan.dailyCalories}
                    </span>
                    <span className="text-surface-400">kcal/day</span>
                  </div>

                  {/* Macro Bars */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-coral-400">
                          <Beef className="w-3 h-3" />
                          Protein
                        </span>
                        <span className="text-surface-300">{plan.proteinGrams}g ({macros.protein}%)</span>
                      </div>
                      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macros.protein}%` }}
                          className="h-full bg-coral-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-lime-400">
                          <Wheat className="w-3 h-3" />
                          Carbs
                        </span>
                        <span className="text-surface-300">{plan.carbGrams}g ({macros.carbs}%)</span>
                      </div>
                      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macros.carbs}%` }}
                          className="h-full bg-lime-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-electric-400">
                          <Droplets className="w-3 h-3" />
                          Fat
                        </span>
                        <span className="text-surface-300">{plan.fatGrams}g ({macros.fat}%)</span>
                      </div>
                      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macros.fat}%` }}
                          className="h-full bg-electric-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-surface-400 pt-3 border-t border-surface-800">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {plan.assignedCount} athletes
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Create New Card */}
          <Link href="/nutrition/builder">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filteredPlans.length * 0.05 }}
              className="glass-card p-8 flex flex-col items-center justify-center min-h-[350px] border-2 border-dashed border-surface-700 hover:border-brand-500/50 cursor-pointer group transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-surface-800 group-hover:bg-brand-500/20 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-8 h-8 text-surface-500 group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-lg font-medium text-surface-400 group-hover:text-surface-100 transition-colors">
                Create New Plan
              </p>
              <p className="text-sm text-surface-500">Build a custom nutrition plan</p>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* TDEE Calculator Modal - Compact and scrollable */}
      <AnimatePresence>
        {showCalculator && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 w-[95vw] max-w-md bg-surface-900 rounded-2xl border border-surface-800 z-50 flex flex-col max-h-[85vh] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-surface-800 flex-shrink-0">
                <h2 className="text-lg font-display font-bold text-surface-100">TDEE Calculator</h2>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={tdeeForm.weight}
                      onChange={(e) => setTdeeForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                      className="input-field py-2" 
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Height (cm)</label>
                    <input 
                      type="number" 
                      value={tdeeForm.height}
                      onChange={(e) => setTdeeForm(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                      className="input-field py-2" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Age</label>
                    <input 
                      type="number" 
                      value={tdeeForm.age}
                      onChange={(e) => setTdeeForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      className="input-field py-2" 
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Gender</label>
                    <select 
                      value={tdeeForm.gender}
                      onChange={(e) => setTdeeForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                      className="input-field py-2"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Activity Level</label>
                  <select 
                    value={tdeeForm.activity}
                    onChange={(e) => setTdeeForm(prev => ({ ...prev, activity: e.target.value as typeof tdeeForm.activity }))}
                    className="input-field py-2"
                  >
                    <option value="sedentary">Sedentary (office job)</option>
                    <option value="light">Light (1-2 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very_active">Very Active (athlete)</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setTdeeForm(prev => ({ ...prev, goal: 'lose' }))}
                      className={`py-1.5 rounded-lg text-xs transition-colors ${
                        tdeeForm.goal === 'lose' 
                          ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' 
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      Lose Fat
                    </button>
                    <button 
                      onClick={() => setTdeeForm(prev => ({ ...prev, goal: 'maintain' }))}
                      className={`py-1.5 rounded-lg text-xs transition-colors ${
                        tdeeForm.goal === 'maintain' 
                          ? 'bg-electric-500/20 text-electric-400 border border-electric-500/30' 
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      Maintain
                    </button>
                    <button 
                      onClick={() => setTdeeForm(prev => ({ ...prev, goal: 'gain' }))}
                      className={`py-1.5 rounded-lg text-xs transition-colors ${
                        tdeeForm.goal === 'gain' 
                          ? 'bg-coral-500/20 text-coral-400 border border-coral-500/30' 
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      Build Muscle
                    </button>
                  </div>
                </div>

                <div className="glass-card p-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-surface-400">TDEE (Maintenance)</p>
                    <p className="text-sm text-surface-300">{tdeeResults.tdee.toLocaleString()} kcal</p>
                  </div>
                  <p className="text-xs text-surface-400 mb-1">Recommended Daily Intake</p>
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-brand-400" />
                    <span className="text-3xl font-bold font-display text-surface-100">{tdeeResults.targetCalories.toLocaleString()}</span>
                    <span className="text-surface-400 text-sm">kcal</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                    <span className="text-coral-400">P: {tdeeResults.protein}g</span>
                    <span className="text-lime-400">C: {tdeeResults.carbs}g</span>
                    <span className="text-electric-400">F: {tdeeResults.fat}g</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-surface-800 flex-shrink-0">
                <button onClick={() => setShowCalculator(false)} className="btn-secondary py-2 px-3 text-sm">
                  Close
                </button>
                <Link 
                  href={`/nutrition/builder?calories=${tdeeResults.targetCalories}&protein=${tdeeResults.protein}&carbs=${tdeeResults.carbs}&fat=${tdeeResults.fat}`} 
                  onClick={() => setShowCalculator(false)} 
                  className="btn-primary py-2 px-3 text-sm"
                >
                  Create Plan
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Plan Modal - Compact */}
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
              className="fixed top-8 left-1/2 -translate-x-1/2 w-[95vw] max-w-md bg-surface-900 rounded-2xl border border-surface-800 z-50 flex flex-col max-h-[85vh] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-surface-800 flex-shrink-0">
                <h2 className="text-lg font-display font-bold text-surface-100">Create Nutrition Plan</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                <div>
                  <label className="label text-xs">Plan Name</label>
                  <input
                    type="text"
                    placeholder="e.g., 2000 kcal Maintenance"
                    className="input-field py-2"
                  />
                </div>
                <div>
                  <label className="label text-xs">Description</label>
                  <textarea
                    placeholder="Describe the goals and focus of this plan..."
                    rows={2}
                    className="input-field py-2 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Daily Calories</label>
                    <input type="number" placeholder="2000" className="input-field py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Meals per Day</label>
                    <input type="number" placeholder="4" className="input-field py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label text-xs">Protein (g)</label>
                    <input type="number" placeholder="150" className="input-field py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Carbs (g)</label>
                    <input type="number" placeholder="200" className="input-field py-2" />
                  </div>
                  <div>
                    <label className="label text-xs">Fat (g)</label>
                    <input type="number" placeholder="67" className="input-field py-2" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-surface-800 flex-shrink-0">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary py-2 px-3 text-sm">
                  Cancel
                </button>
                <Link href="/nutrition/builder" onClick={() => setShowCreateModal(false)} className="btn-primary py-2 px-3 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View/Edit Plan Modal */}
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
              className="fixed inset-4 md:inset-8 bg-surface-900 rounded-2xl border border-surface-800 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-lime-500/20 flex items-center justify-center">
                    <Apple className="w-7 h-7 text-lime-400" />
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
                    href={`/nutrition/builder?id=${selectedPlan.id}&name=${encodeURIComponent(selectedPlan.name)}&calories=${selectedPlan.dailyCalories}&protein=${selectedPlan.proteinGrams}&carbs=${selectedPlan.carbGrams}&fat=${selectedPlan.fatGrams}&meals=${selectedPlan.mealsPerDay}`}
                    onClick={() => setSelectedPlan(null)}
                    className="btn-secondary"
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

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Left Column - Daily Overview */}
                  <div className="col-span-2 space-y-6">
                    {/* Macro Summary */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-surface-100 mb-4">Daily Targets</h3>
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-center">
                          <Flame className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                          <p className="text-4xl font-bold font-display text-surface-100">{selectedPlan.dailyCalories}</p>
                          <p className="text-surface-500">kcal/day</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-coral-500/10 border border-coral-500/20 text-center">
                          <Beef className="w-6 h-6 text-coral-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-coral-400">{selectedPlan.proteinGrams}g</p>
                          <p className="text-sm text-surface-500">Protein</p>
                        </div>
                        <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/20 text-center">
                          <Wheat className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-lime-400">{selectedPlan.carbGrams}g</p>
                          <p className="text-sm text-surface-500">Carbs</p>
                        </div>
                        <div className="p-4 rounded-xl bg-electric-500/10 border border-electric-500/20 text-center">
                          <Droplets className="w-6 h-6 text-electric-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-electric-400">{selectedPlan.fatGrams}g</p>
                          <p className="text-sm text-surface-500">Fat</p>
                        </div>
                      </div>
                    </div>

                    {/* Sample Meals - Clickable */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-surface-100 mb-4">Meal Structure ({selectedPlan.mealsPerDay} meals/day)</h3>
                      <div className="space-y-3">
                        {(mockMeals[selectedPlan.id] || mockMeals['1']).slice(0, selectedPlan.mealsPerDay).map((meal, idx) => (
                          <div key={idx} className="rounded-xl bg-surface-800/50 overflow-hidden">
                            <button
                              onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-surface-800/70 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                                <span className="text-lime-400 font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-surface-100">{meal.name}</p>
                                <p className="text-sm text-surface-500">{meal.time} • ~{meal.foods.reduce((sum, f) => sum + f.calories, 0)} kcal</p>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedMeal === idx ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-5 h-5 text-surface-500" />
                              </motion.div>
                            </button>
                            
                            <AnimatePresence>
                              {expandedMeal === idx && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-surface-700/50"
                                >
                                  <div className="p-4 space-y-2">
                                    {meal.foods.map((food, foodIdx) => (
                                      <div key={foodIdx} className="flex items-center justify-between p-3 rounded-lg bg-surface-900/50">
                                        <div>
                                          <p className="font-medium text-surface-200 text-sm">{food.name}</p>
                                          <p className="text-xs text-surface-500">{food.amount}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                          <span className="text-surface-400">{food.calories} kcal</span>
                                          <span className="text-coral-400">P:{food.protein}g</span>
                                          <span className="text-lime-400">C:{food.carbs}g</span>
                                          <span className="text-electric-400">F:{food.fat}g</span>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-surface-700/50 mt-2">
                                      <span className="text-sm text-surface-400">Total</span>
                                      <div className="flex items-center gap-3 text-xs font-medium">
                                        <span className="text-surface-200">{meal.foods.reduce((sum, f) => sum + f.calories, 0)} kcal</span>
                                        <span className="text-coral-400">P:{meal.foods.reduce((sum, f) => sum + f.protein, 0)}g</span>
                                        <span className="text-lime-400">C:{meal.foods.reduce((sum, f) => sum + f.carbs, 0)}g</span>
                                        <span className="text-electric-400">F:{meal.foods.reduce((sum, f) => sum + f.fat, 0)}g</span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Plan Info */}
                  <div className="space-y-4">
                    <div className="glass-card p-4">
                      <h4 className="font-medium text-surface-100 mb-4">Plan Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Meals per Day</span>
                          <span className="font-medium text-surface-100">{selectedPlan.mealsPerDay}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Athletes Assigned</span>
                          <span className="font-medium text-surface-100">{selectedPlan.assignedCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Template</span>
                          <span className="font-medium text-surface-100">{selectedPlan.isTemplate ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Created</span>
                          <span className="font-medium text-surface-100">
                            {new Date(selectedPlan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
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
                            const duplicatedPlan: NutritionPlan = {
                              ...selectedPlan,
                              id: `${selectedPlan.id}-copy-${Date.now()}`,
                              name: `${selectedPlan.name} (Copy)`,
                              assignedCount: 0,
                              createdAt: new Date().toISOString().split('T')[0],
                            };
                            
                            setNutritionPlans(prev => [...prev, duplicatedPlan]);
                            setDuplicating(false);
                            setSelectedPlan(null);
                          }}
                          disabled={duplicating}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors text-left disabled:opacity-50"
                        >
                          {duplicating ? (
                            <RefreshCw className="w-4 h-4 text-surface-400 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4 text-surface-400" />
                          )}
                          <span className="text-surface-300">{duplicating ? 'Duplicating...' : 'Duplicate Plan'}</span>
                        </button>
                        <Link 
                          href="/nutrition/grocery-list"
                          onClick={() => setSelectedPlan(null)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors text-left"
                        >
                          <ShoppingCart className="w-4 h-4 text-surface-400" />
                          <span className="text-surface-300">Generate Grocery List</span>
                        </Link>
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

      {/* Assign to Athletes Modal */}
      <AnimatePresence>
        {showAssignModal && selectedPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAssignModal(false);
                setSelectedAthletes([]);
              }}
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
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAthletes([]);
                  }}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-bold text-sm">
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
                  <button 
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedAthletes([]);
                    }} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (selectedAthletes.length > 0 && selectedPlan) {
                        // Update the plan's assigned count
                        setNutritionPlans(prev => prev.map(plan => 
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

