'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Trash2,
  Printer,
  Share2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Apple,
  Beef,
  Milk,
  Wheat,
  Egg,
  Carrot,
  Settings,
} from 'lucide-react';

// Mock meal plan data - would come from the nutrition plan
const mockMealPlan = {
  name: "Sarah's Weight Loss Plan",
  days: 7,
  meals: [
    { name: 'Breakfast', foods: [
      { id: '1', name: 'Eggs', quantity: 3, unit: 'large', category: 'Protein', perDay: 3 },
      { id: '2', name: 'Oatmeal', quantity: 50, unit: 'g', category: 'Grains', perDay: 50 },
      { id: '3', name: 'Banana', quantity: 1, unit: 'medium', category: 'Fruits', perDay: 1 },
      { id: '4', name: 'Greek Yogurt', quantity: 150, unit: 'g', category: 'Dairy', perDay: 150 },
    ]},
    { name: 'Lunch', foods: [
      { id: '5', name: 'Chicken Breast', quantity: 150, unit: 'g', category: 'Protein', perDay: 150 },
      { id: '6', name: 'Brown Rice', quantity: 100, unit: 'g', category: 'Grains', perDay: 100 },
      { id: '7', name: 'Broccoli', quantity: 100, unit: 'g', category: 'Vegetables', perDay: 100 },
      { id: '8', name: 'Olive Oil', quantity: 15, unit: 'ml', category: 'Fats', perDay: 15 },
    ]},
    { name: 'Snack', foods: [
      { id: '9', name: 'Almonds', quantity: 30, unit: 'g', category: 'Fats', perDay: 30 },
      { id: '10', name: 'Apple', quantity: 1, unit: 'medium', category: 'Fruits', perDay: 1 },
    ]},
    { name: 'Dinner', foods: [
      { id: '11', name: 'Salmon', quantity: 150, unit: 'g', category: 'Protein', perDay: 150 },
      { id: '12', name: 'Sweet Potato', quantity: 150, unit: 'g', category: 'Carbs', perDay: 150 },
      { id: '13', name: 'Spinach', quantity: 100, unit: 'g', category: 'Vegetables', perDay: 100 },
      { id: '14', name: 'Avocado', quantity: 50, unit: 'g', category: 'Fats', perDay: 50 },
    ]},
  ],
};

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  customAdded?: boolean;
}

const categoryIcons: Record<string, typeof Apple> = {
  'Protein': Beef,
  'Dairy': Milk,
  'Grains': Wheat,
  'Carbs': Wheat,
  'Fruits': Apple,
  'Vegetables': Carrot,
  'Fats': Egg,
  'Other': ShoppingCart,
};

const categoryColors: Record<string, string> = {
  'Protein': 'coral',
  'Dairy': 'electric',
  'Grains': 'amber',
  'Carbs': 'amber',
  'Fruits': 'lime',
  'Vegetables': 'lime',
  'Fats': 'brand',
  'Other': 'surface',
};

export default function GroceryListPage() {
  const [daysToShop, setDaysToShop] = useState(7);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Protein', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Fats']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'unit', category: 'Other' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Generate grocery list from meal plan
  const generateGroceryList = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Aggregate all foods across meals
    const aggregatedFoods: Record<string, GroceryItem> = {};

    mockMealPlan.meals.forEach(meal => {
      meal.foods.forEach(food => {
        if (aggregatedFoods[food.id]) {
          // Already exists, add quantity
          aggregatedFoods[food.id].quantity += food.perDay * daysToShop;
        } else {
          aggregatedFoods[food.id] = {
            id: food.id,
            name: food.name,
            quantity: food.perDay * daysToShop,
            unit: food.unit,
            category: food.category,
            checked: false,
          };
        }
      });
    });

    setGroceryList(Object.values(aggregatedFoods));
    setIsGenerating(false);
    setIsGenerated(true);
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const filtered = groceryList.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [groceryList, searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleItem = (itemId: string) => {
    setGroceryList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setGroceryList(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== itemId));
  };

  const addCustomItem = () => {
    if (!newItem.name.trim()) return;
    
    const customItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      category: newItem.category,
      checked: false,
      customAdded: true,
    };

    setGroceryList(prev => [...prev, customItem]);
    setNewItem({ name: '', quantity: 1, unit: 'unit', category: 'Other' });
    setShowAddModal(false);
  };

  const checkedCount = groceryList.filter(item => item.checked).length;
  const totalCount = groceryList.length;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const listText = Object.entries(groupedItems)
      .map(([category, items]) => {
        const itemsText = items
          .map(item => `${item.checked ? '✓' : '○'} ${item.name} - ${item.quantity} ${item.unit}`)
          .join('\n');
        return `${category}:\n${itemsText}`;
      })
      .join('\n\n');

    if (navigator.share) {
      await navigator.share({
        title: 'Grocery List',
        text: listText,
      });
    } else {
      navigator.clipboard.writeText(listText);
      // Show toast notification in real app
    }
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
              <h1 className="text-2xl font-display font-bold text-surface-100">Grocery List Generator</h1>
              <p className="text-surface-400">Auto-generate shopping lists from meal plans</p>
            </div>
          </div>
          {isGenerated && (
            <div className="flex items-center gap-3">
              <button onClick={handleShare} className="btn-secondary py-2">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button onClick={handlePrint} className="btn-secondary py-2">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-8">
        {!isGenerated ? (
          /* Generator Settings */
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-lime-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-100">
                    Generate Grocery List
                  </h2>
                  <p className="text-surface-500">
                    Based on: {mockMealPlan.name}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="label">Shopping for how many days?</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={daysToShop}
                      onChange={(e) => setDaysToShop(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-surface-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <span className="text-2xl font-bold text-surface-100 min-w-[4ch] text-center">
                      {daysToShop}
                    </span>
                    <span className="text-surface-400">days</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                  <h3 className="text-sm font-medium text-surface-400 mb-3">Meal Plan Preview</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockMealPlan.meals.map((meal, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-surface-700/50 text-surface-300 text-sm"
                      >
                        {meal.name} ({meal.foods.length} items)
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateGroceryList}
                  disabled={isGenerating}
                  className="btn-primary w-full py-4 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Generate Grocery List
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Generated Grocery List */
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-surface-400">Shopping Progress</span>
                <span className="font-medium text-surface-100">
                  {checkedCount} / {totalCount} items
                </span>
              </div>
              <div className="h-3 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
                  className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full"
                />
              </div>
            </div>

            {/* Search & Add */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-secondary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Item
              </button>
            </div>

            {/* Grocery Categories */}
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items]) => {
                const isExpanded = expandedCategories.has(category);
                const checkedInCategory = items.filter(i => i.checked).length;
                const Icon = categoryIcons[category] || ShoppingCart;
                const colorClass = categoryColors[category] || 'surface';

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${colorClass}-500/20 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${colorClass}-400`} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-surface-100">{category}</p>
                          <p className="text-sm text-surface-500">
                            {checkedInCategory}/{items.length} items
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-surface-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-surface-500" />
                      )}
                    </button>

                    {/* Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-surface-800/50"
                        >
                          {items.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              className={`flex items-center gap-4 p-4 border-b border-surface-800/30 last:border-b-0 ${
                                item.checked ? 'bg-lime-500/5' : ''
                              }`}
                            >
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleItem(item.id)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  item.checked
                                    ? 'bg-lime-500 border-lime-500'
                                    : 'border-surface-600 hover:border-surface-400'
                                }`}
                              >
                                {item.checked && <Check className="w-4 h-4 text-white" />}
                              </button>

                              {/* Item Name */}
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  item.checked ? 'text-surface-500 line-through' : 'text-surface-100'
                                }`}>
                                  {item.name}
                                  {item.customAdded && (
                                    <span className="ml-2 text-xs text-brand-400">(custom)</span>
                                  )}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-surface-800 hover:bg-surface-700 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-surface-400" />
                                </button>
                                <span className="min-w-[80px] text-center text-surface-100">
                                  {item.quantity} {item.unit}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 rounded-lg bg-surface-800 hover:bg-surface-700 flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-surface-400" />
                                </button>
                              </div>

                              {/* Remove */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-coral-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Regenerate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => { setIsGenerated(false); setGroceryList([]); }}
                className="btn-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New List
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800">
                <h2 className="text-xl font-display font-bold text-surface-100">Add Custom Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <Plus className="w-5 h-5 text-surface-400 rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Protein Powder"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="label">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="input-field"
                    >
                      <option value="unit">units</option>
                      <option value="g">grams</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Protein">Protein</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Fats">Fats</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-surface-800">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomItem}
                  disabled={!newItem.name.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

