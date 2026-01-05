'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Plus,
  Search,
  GripVertical,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  X,
  Apple,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Clock,
  Calculator,
  RefreshCw,
  Settings,
  CheckCircle,
} from 'lucide-react';

// Mock food database
const foodDatabase = [
  { id: 'f1', name: 'Chicken Breast', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { id: 'f2', name: 'Salmon', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { id: 'f3', name: 'Eggs', category: 'Protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { id: 'f4', name: 'Greek Yogurt', category: 'Dairy', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.7 },
  { id: 'f5', name: 'Cottage Cheese', category: 'Dairy', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { id: 'f6', name: 'White Rice', category: 'Carbs', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { id: 'f7', name: 'Brown Rice', category: 'Carbs', caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9 },
  { id: 'f8', name: 'Sweet Potato', category: 'Carbs', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
  { id: 'f9', name: 'Oatmeal', category: 'Carbs', caloriesPer100g: 68, proteinPer100g: 2.4, carbsPer100g: 12, fatPer100g: 1.4 },
  { id: 'f10', name: 'Whole Wheat Bread', category: 'Carbs', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { id: 'f11', name: 'Avocado', category: 'Fats', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
  { id: 'f12', name: 'Olive Oil', category: 'Fats', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { id: 'f13', name: 'Almonds', category: 'Fats', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { id: 'f14', name: 'Peanut Butter', category: 'Fats', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { id: 'f15', name: 'Broccoli', category: 'Vegetables', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
  { id: 'f16', name: 'Spinach', category: 'Vegetables', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { id: 'f17', name: 'Banana', category: 'Fruits', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { id: 'f18', name: 'Apple', category: 'Fruits', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { id: 'f19', name: 'Whey Protein', category: 'Supplements', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 10, fatPer100g: 5 },
  { id: 'f20', name: 'Beef (Lean)', category: 'Protein', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
];

const categories = ['All', 'Protein', 'Carbs', 'Fats', 'Vegetables', 'Fruits', 'Dairy', 'Supplements'];

interface FoodItem {
  id: string;
  foodId: string;
  name: string;
  quantity: number; // in grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  timeSlot: string;
  foods: FoodItem[];
  isExpanded: boolean;
}

// Mock existing nutrition plans data (for editing)
const existingNutritionPlans: Record<string, { name: string; description: string; calories: number; protein: number; carbs: number; fat: number; meals: Meal[] }> = {
  '1': {
    name: '1600 kcal Cut',
    description: 'Low calorie plan for aggressive fat loss',
    calories: 1600,
    protein: 160,
    carbs: 120,
    fat: 53,
    meals: [
      { id: 'meal1', name: 'Breakfast', timeSlot: '07:00', isExpanded: true, foods: [
        { id: 'f1-1', foodId: 'f3', name: 'Eggs', quantity: 150, calories: 232, protein: 19.5, carbs: 1.65, fat: 16.5 },
        { id: 'f1-2', foodId: 'f9', name: 'Oatmeal', quantity: 80, calories: 54, protein: 1.92, carbs: 9.6, fat: 1.12 },
      ]},
      { id: 'meal2', name: 'Lunch', timeSlot: '12:00', isExpanded: false, foods: [
        { id: 'f2-1', foodId: 'f1', name: 'Chicken Breast', quantity: 200, calories: 330, protein: 62, carbs: 0, fat: 7.2 },
        { id: 'f2-2', foodId: 'f6', name: 'White Rice', quantity: 100, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        { id: 'f2-3', foodId: 'f15', name: 'Broccoli', quantity: 150, calories: 51, protein: 4.2, carbs: 10.5, fat: 0.6 },
      ]},
      { id: 'meal3', name: 'Dinner', timeSlot: '18:00', isExpanded: false, foods: [
        { id: 'f3-1', foodId: 'f2', name: 'Salmon', quantity: 180, calories: 374, protein: 36, carbs: 0, fat: 23.4 },
        { id: 'f3-2', foodId: 'f8', name: 'Sweet Potato', quantity: 150, calories: 129, protein: 2.4, carbs: 30, fat: 0.15 },
      ]},
      { id: 'meal4', name: 'Snack', timeSlot: '16:00', isExpanded: false, foods: [
        { id: 'f4-1', foodId: 'f4', name: 'Greek Yogurt', quantity: 200, calories: 118, protein: 20, carbs: 7.2, fat: 1.4 },
      ]},
    ],
  },
  '2': {
    name: '3200 kcal Bulk',
    description: 'High calorie plan for muscle building',
    calories: 3200,
    protein: 200,
    carbs: 400,
    fat: 89,
    meals: [
      { id: 'meal1', name: 'Breakfast', timeSlot: '07:00', isExpanded: true, foods: [
        { id: 'f1-1', foodId: 'f3', name: 'Eggs', quantity: 200, calories: 310, protein: 26, carbs: 2.2, fat: 22 },
        { id: 'f1-2', foodId: 'f9', name: 'Oatmeal', quantity: 150, calories: 102, protein: 3.6, carbs: 18, fat: 2.1 },
        { id: 'f1-3', foodId: 'f17', name: 'Banana', quantity: 120, calories: 107, protein: 1.32, carbs: 27.6, fat: 0.36 },
      ]},
      { id: 'meal2', name: 'Lunch', timeSlot: '12:00', isExpanded: false, foods: [
        { id: 'f2-1', foodId: 'f20', name: 'Beef (Lean)', quantity: 250, calories: 625, protein: 65, carbs: 0, fat: 37.5 },
        { id: 'f2-2', foodId: 'f7', name: 'Brown Rice', quantity: 200, calories: 224, protein: 5.2, carbs: 48, fat: 1.8 },
      ]},
      { id: 'meal3', name: 'Pre-Workout', timeSlot: '15:00', isExpanded: false, foods: [
        { id: 'f3-1', foodId: 'f19', name: 'Whey Protein', quantity: 40, calories: 160, protein: 32, carbs: 4, fat: 2 },
        { id: 'f3-2', foodId: 'f17', name: 'Banana', quantity: 100, calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      ]},
      { id: 'meal4', name: 'Dinner', timeSlot: '19:00', isExpanded: false, foods: [
        { id: 'f4-1', foodId: 'f1', name: 'Chicken Breast', quantity: 300, calories: 495, protein: 93, carbs: 0, fat: 10.8 },
        { id: 'f4-2', foodId: 'f8', name: 'Sweet Potato', quantity: 200, calories: 172, protein: 3.2, carbs: 40, fat: 0.2 },
      ]},
      { id: 'meal5', name: 'Evening Snack', timeSlot: '21:00', isExpanded: false, foods: [
        { id: 'f5-1', foodId: 'f5', name: 'Cottage Cheese', quantity: 200, calories: 196, protein: 22, carbs: 6.8, fat: 8.6 },
        { id: 'f5-2', foodId: 'f13', name: 'Almonds', quantity: 30, calories: 174, protein: 6.3, carbs: 6.6, fat: 15 },
      ]},
    ],
  },
  '3': {
    name: '2000 kcal Maintain',
    description: 'Balanced plan for weight maintenance',
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 67,
    meals: [
      { id: 'meal1', name: 'Breakfast', timeSlot: '07:30', isExpanded: true, foods: [
        { id: 'f1-1', foodId: 'f3', name: 'Eggs', quantity: 100, calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        { id: 'f1-2', foodId: 'f10', name: 'Whole Wheat Bread', quantity: 60, calories: 148, protein: 7.8, carbs: 24.6, fat: 2.04 },
        { id: 'f1-3', foodId: 'f11', name: 'Avocado', quantity: 50, calories: 80, protein: 1, carbs: 4.5, fat: 7.5 },
      ]},
      { id: 'meal2', name: 'Lunch', timeSlot: '12:30', isExpanded: false, foods: [
        { id: 'f2-1', foodId: 'f1', name: 'Chicken Breast', quantity: 180, calories: 297, protein: 55.8, carbs: 0, fat: 6.48 },
        { id: 'f2-2', foodId: 'f7', name: 'Brown Rice', quantity: 150, calories: 168, protein: 3.9, carbs: 36, fat: 1.35 },
        { id: 'f2-3', foodId: 'f16', name: 'Spinach', quantity: 100, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      ]},
      { id: 'meal3', name: 'Snack', timeSlot: '16:00', isExpanded: false, foods: [
        { id: 'f3-1', foodId: 'f4', name: 'Greek Yogurt', quantity: 150, calories: 88.5, protein: 15, carbs: 5.4, fat: 1.05 },
        { id: 'f3-2', foodId: 'f18', name: 'Apple', quantity: 150, calories: 78, protein: 0.45, carbs: 21, fat: 0.3 },
      ]},
      { id: 'meal4', name: 'Dinner', timeSlot: '19:30', isExpanded: false, foods: [
        { id: 'f4-1', foodId: 'f2', name: 'Salmon', quantity: 150, calories: 312, protein: 30, carbs: 0, fat: 19.5 },
        { id: 'f4-2', foodId: 'f8', name: 'Sweet Potato', quantity: 180, calories: 155, protein: 2.88, carbs: 36, fat: 0.18 },
        { id: 'f4-3', foodId: 'f15', name: 'Broccoli', quantity: 120, calories: 41, protein: 3.36, carbs: 8.4, fat: 0.48 },
      ]},
    ],
  },
};

function NutritionBuilderContent() {
  const searchParams = useSearchParams();
  
  // Get URL parameters for editing or TDEE calculator values
  const editId = searchParams.get('id');
  const urlName = searchParams.get('name');
  const urlCalories = searchParams.get('calories');
  const urlProtein = searchParams.get('protein');
  const urlCarbs = searchParams.get('carbs');
  const urlFat = searchParams.get('fat');
  const urlMeals = searchParams.get('meals');
  
  const [planName, setPlanName] = useState('New Nutrition Plan');
  const [planDescription, setPlanDescription] = useState('');
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(200);
  const [targetFat, setTargetFat] = useState(67);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'meal1', name: 'Breakfast', timeSlot: '07:00', foods: [], isExpanded: true },
    { id: 'meal2', name: 'Lunch', timeSlot: '12:00', foods: [], isExpanded: false },
    { id: 'meal3', name: 'Pre-Workout', timeSlot: '16:00', foods: [], isExpanded: false },
    { id: 'meal4', name: 'Dinner', timeSlot: '19:00', foods: [], isExpanded: false },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<typeof foodDatabase[0] | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing plan data or URL parameters on mount
  useEffect(() => {
    // First check if we have full plan data in existingNutritionPlans (for editing)
    if (editId && existingNutritionPlans[editId]) {
      const plan = existingNutritionPlans[editId];
      setPlanName(plan.name);
      setPlanDescription(plan.description);
      setTargetCalories(plan.calories);
      setTargetProtein(plan.protein);
      setTargetCarbs(plan.carbs);
      setTargetFat(plan.fat);
      setMeals(plan.meals);
      setIsEditMode(true);
      return; // Don't process URL params if we loaded from existing plans
    }
    
    // Otherwise, load from URL parameters
    if (editId) {
      setIsEditMode(true);
    }
    if (urlName) {
      setPlanName(decodeURIComponent(urlName));
    }
    if (urlCalories) {
      setTargetCalories(parseInt(urlCalories) || 2000);
    }
    if (urlProtein) {
      setTargetProtein(parseInt(urlProtein) || 150);
    }
    if (urlCarbs) {
      setTargetCarbs(parseInt(urlCarbs) || 200);
    }
    if (urlFat) {
      setTargetFat(parseInt(urlFat) || 67);
    }
    if (urlMeals) {
      const numMeals = parseInt(urlMeals) || 4;
      const mealNames = ['Breakfast', 'Lunch', 'Snack', 'Pre-Workout', 'Dinner', 'Evening Snack'];
      const newMeals: Meal[] = Array.from({ length: numMeals }, (_, i) => ({
        id: `meal${i + 1}`,
        name: mealNames[i] || `Meal ${i + 1}`,
        timeSlot: `${7 + Math.floor(i * 12 / numMeals)}:00`.padStart(5, '0'),
        foods: [],
        isExpanded: i === 0,
      }));
      setMeals(newMeals);
    }
  }, [editId, urlName, urlCalories, urlProtein, urlCarbs, urlFat, urlMeals]);

  const filteredFoods = foodDatabase.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => {
      const mealTotals = meal.foods.reduce(
        (mealAcc, food) => ({
          calories: mealAcc.calories + food.calories,
          protein: mealAcc.protein + food.protein,
          carbs: mealAcc.carbs + food.carbs,
          fat: mealAcc.fat + food.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return {
        calories: acc.calories + mealTotals.calories,
        protein: acc.protein + mealTotals.protein,
        carbs: acc.carbs + mealTotals.carbs,
        fat: acc.fat + mealTotals.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addFoodToMeal = () => {
    if (!activeMeal || !selectedFood) return;

    const quantity = foodQuantity;
    const multiplier = quantity / 100;

    const newFood: FoodItem = {
      id: `${selectedFood.id}-${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      quantity,
      calories: Math.round(selectedFood.caloriesPer100g * multiplier),
      protein: Math.round(selectedFood.proteinPer100g * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbsPer100g * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fatPer100g * multiplier * 10) / 10,
    };

    setMeals(prev => prev.map(meal =>
      meal.id === activeMeal
        ? { ...meal, foods: [...meal.foods, newFood] }
        : meal
    ));

    setShowFoodModal(false);
    setSelectedFood(null);
    setFoodQuantity(100);
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, foods: meal.foods.filter(f => f.id !== foodId) }
        : meal
    ));
  };

  const updateFoodQuantity = (mealId: string, foodId: string, newQuantity: number) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? {
            ...meal,
            foods: meal.foods.map(food => {
              if (food.id !== foodId) return food;
              const originalFood = foodDatabase.find(f => f.id === food.foodId);
              if (!originalFood) return food;
              const multiplier = newQuantity / 100;
              return {
                ...food,
                quantity: newQuantity,
                calories: Math.round(originalFood.caloriesPer100g * multiplier),
                protein: Math.round(originalFood.proteinPer100g * multiplier * 10) / 10,
                carbs: Math.round(originalFood.carbsPer100g * multiplier * 10) / 10,
                fat: Math.round(originalFood.fatPer100g * multiplier * 10) / 10,
              };
            }),
          }
        : meal
    ));
  };

  const toggleMealExpanded = (mealId: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId ? { ...meal, isExpanded: !meal.isExpanded } : meal
    ));
  };

  const addNewMeal = () => {
    const newMeal: Meal = {
      id: `meal${meals.length + 1}-${Date.now()}`,
      name: `Meal ${meals.length + 1}`,
      timeSlot: '12:00',
      foods: [],
      isExpanded: true,
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const removeMeal = (mealId: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  const reorderFoods = (mealId: string, newOrder: FoodItem[]) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId ? { ...meal, foods: newOrder } : meal
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getMealTotals = (meal: Meal) => {
    return meal.foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/nutrition" className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-surface-400" />
            </Link>
            <div>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="text-2xl font-display font-bold text-surface-100 bg-transparent border-none focus:outline-none focus:ring-0"
              />
              <p className="text-surface-400">{isEditMode ? 'Editing Nutrition Plan' : 'Create New Nutrition Plan'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary ${saveSuccess ? 'bg-lime-600 hover:bg-lime-500' : ''}`}
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                  </motion.div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Plan' : 'Save Plan'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Builder Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Macro Targets */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4">Daily Targets</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-400" />
                  Calories
                </label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Beef className="w-4 h-4 text-coral-400" />
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-lime-400" />
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-electric-400" />
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Calories</span>
                  <span className={totals.calories > targetCalories ? 'text-coral-400' : 'text-surface-100'}>
                    {totals.calories} / {targetCalories}
                  </span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.calories / targetCalories) * 100, 100)}%` }}
                    className={`h-full rounded-full ${totals.calories > targetCalories ? 'bg-coral-500' : 'bg-brand-500'}`}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Protein</span>
                  <span className="text-surface-100">{Math.round(totals.protein)}g / {targetProtein}g</span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.protein / targetProtein) * 100, 100)}%` }}
                    className="h-full bg-coral-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Carbs</span>
                  <span className="text-surface-100">{Math.round(totals.carbs)}g / {targetCarbs}g</span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.carbs / targetCarbs) * 100, 100)}%` }}
                    className="h-full bg-lime-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Fat</span>
                  <span className="text-surface-100">{Math.round(totals.fat)}g / {targetFat}g</span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.fat / targetFat) * 100, 100)}%` }}
                    className="h-full bg-electric-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            {meals.map((meal, mealIndex) => {
              const mealTotals = getMealTotals(meal);
              return (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mealIndex * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Meal Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-surface-800/30 cursor-pointer"
                    onClick={() => toggleMealExpanded(meal.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
                        <Apple className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={meal.name}
                            onChange={(e) => {
                              e.stopPropagation();
                              setMeals(prev => prev.map(m =>
                                m.id === meal.id ? { ...m, name: e.target.value } : m
                              ));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-surface-100 bg-transparent border-none focus:outline-none focus:ring-0"
                          />
                          <div className="flex items-center gap-1 text-surface-500">
                            <Clock className="w-3 h-3" />
                            <input
                              type="time"
                              value={meal.timeSlot}
                              onChange={(e) => {
                                e.stopPropagation();
                                setMeals(prev => prev.map(m =>
                                  m.id === meal.id ? { ...m, timeSlot: e.target.value } : m
                                ));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-transparent border-none focus:outline-none text-surface-400"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-surface-500">
                          {meal.foods.length} items • {mealTotals.calories} kcal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-4 text-xs text-surface-500">
                        <span>P: {Math.round(mealTotals.protein)}g</span>
                        <span>C: {Math.round(mealTotals.carbs)}g</span>
                        <span>F: {Math.round(mealTotals.fat)}g</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeal(meal.id);
                        }}
                        className="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-500 hover:text-coral-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {meal.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-surface-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-surface-500" />
                      )}
                    </div>
                  </div>

                  {/* Meal Content */}
                  <AnimatePresence>
                    {meal.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          {/* Foods List */}
                          <Reorder.Group
                            axis="y"
                            values={meal.foods}
                            onReorder={(newOrder) => reorderFoods(meal.id, newOrder)}
                            className="space-y-2"
                          >
                            {meal.foods.map((food) => (
                              <Reorder.Item
                                key={food.id}
                                value={food}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 group"
                              >
                                <div className="cursor-grab active:cursor-grabbing text-surface-600 hover:text-surface-400">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-surface-100 text-sm">{food.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={food.quantity}
                                      onChange={(e) => updateFoodQuantity(meal.id, food.id, parseInt(e.target.value) || 0)}
                                      className="w-16 input-field py-1 px-2 text-center text-sm"
                                    />
                                    <span className="text-xs text-surface-500">g</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-surface-400 min-w-[180px]">
                                    <span>{food.calories} kcal</span>
                                    <span className="text-coral-400">P:{food.protein}g</span>
                                    <span className="text-lime-400">C:{food.carbs}g</span>
                                    <span className="text-electric-400">F:{food.fat}g</span>
                                  </div>
                                  <button
                                    onClick={() => removeFood(meal.id, food.id)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all text-surface-500 hover:text-coral-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>

                          {/* Add Food Button */}
                          <button
                            onClick={() => {
                              setActiveMeal(meal.id);
                              setShowFoodModal(true);
                            }}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-surface-700 text-surface-500 hover:border-lime-500/50 hover:text-lime-400 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Food
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Add Meal Button */}
            <button
              onClick={addNewMeal}
              className="w-full py-5 rounded-xl border-2 border-dashed border-surface-700 text-surface-500 hover:border-lime-500/50 hover:text-lime-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Meal
            </button>
          </div>
        </div>

        {/* Food Library Sidebar */}
        <div className="w-80 bg-surface-900/50 border-l border-surface-800/50 flex flex-col">
          <div className="p-4 border-b border-surface-800/50">
            <h3 className="font-semibold text-surface-100 mb-3">Food Library</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 border-b border-surface-800/50">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-lime-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredFoods.map((food) => (
              <motion.div
                key={food.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:border-lime-500/30 transition-all group"
                onClick={() => {
                  const expandedMeal = meals.find(m => m.isExpanded);
                  if (expandedMeal) {
                    setActiveMeal(expandedMeal.id);
                    setSelectedFood(food);
                    setShowFoodModal(true);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-surface-100 text-sm">{food.name}</p>
                  <Plus className="w-4 h-4 text-surface-500 group-hover:text-lime-400 transition-colors" />
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span>{food.caloriesPer100g} kcal</span>
                  <span>•</span>
                  <span>P:{food.proteinPer100g}g</span>
                  <span>C:{food.carbsPer100g}g</span>
                  <span>F:{food.fatPer100g}g</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {showFoodModal && selectedFood && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowFoodModal(false);
                setSelectedFood(null);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800">
                <h2 className="text-xl font-display font-bold text-surface-100">Add Food</h2>
                <button
                  onClick={() => {
                    setShowFoodModal(false);
                    setSelectedFood(null);
                  }}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
                  <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-100">{selectedFood.name}</p>
                    <p className="text-sm text-surface-500">{selectedFood.category}</p>
                  </div>
                </div>

                <div>
                  <label className="label">Quantity (grams)</label>
                  <input
                    type="number"
                    value={foodQuantity}
                    onChange={(e) => setFoodQuantity(parseInt(e.target.value) || 0)}
                    className="input-field text-center text-xl font-bold"
                  />
                  <div className="flex justify-center gap-2 mt-2">
                    {[50, 100, 150, 200].map((q) => (
                      <button
                        key={q}
                        onClick={() => setFoodQuantity(q)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          foodQuantity === q
                            ? 'bg-lime-500 text-white'
                            : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                        }`}
                      >
                        {q}g
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-surface-800/30">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-400">
                      {Math.round(selectedFood.caloriesPer100g * foodQuantity / 100)}
                    </p>
                    <p className="text-xs text-surface-500">kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-coral-400">
                      {Math.round(selectedFood.proteinPer100g * foodQuantity / 100 * 10) / 10}
                    </p>
                    <p className="text-xs text-surface-500">protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-lime-400">
                      {Math.round(selectedFood.carbsPer100g * foodQuantity / 100 * 10) / 10}
                    </p>
                    <p className="text-xs text-surface-500">carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-electric-400">
                      {Math.round(selectedFood.fatPer100g * foodQuantity / 100 * 10) / 10}
                    </p>
                    <p className="text-xs text-surface-500">fat</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-surface-800">
                <button
                  onClick={() => {
                    setShowFoodModal(false);
                    setSelectedFood(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={addFoodToMeal} className="flex-1 btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Meal
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default function NutritionBuilderPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </DashboardLayout>
    }>
      <NutritionBuilderContent />
    </Suspense>
  );
}

