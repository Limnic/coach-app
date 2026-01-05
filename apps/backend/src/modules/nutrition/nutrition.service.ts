import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculatorService } from '../calculator/calculator.service';

@Injectable()
export class NutritionService {
  constructor(
    private prisma: PrismaService,
    private calculator: CalculatorService,
  ) {}

  // ============================================
  // NUTRITION PLANS
  // ============================================

  async createNutritionPlan(coachId: string, data: {
    name: string;
    description?: string;
    dailyCalories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    mealsPerDay?: number;
    isTemplate?: boolean;
  }) {
    const totalMacroCalories = (data.proteinGrams * 4) + (data.carbGrams * 4) + (data.fatGrams * 9);
    
    return this.prisma.nutritionPlan.create({
      data: {
        ...data,
        coachId,
        proteinRatio: (data.proteinGrams * 4) / totalMacroCalories,
        carbRatio: (data.carbGrams * 4) / totalMacroCalories,
        fatRatio: (data.fatGrams * 9) / totalMacroCalories,
      },
    });
  }

  async getNutritionPlans(coachId: string, templatesOnly = false) {
    return this.prisma.nutritionPlan.findMany({
      where: {
        coachId,
        ...(templatesOnly ? { isTemplate: true } : {}),
      },
      include: {
        meals: {
          include: { items: { include: { foodItem: true } } },
        },
        _count: { select: { assignedTo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNutritionPlanById(id: string) {
    const plan = await this.prisma.nutritionPlan.findUnique({
      where: { id },
      include: {
        meals: {
          orderBy: { orderIndex: 'asc' },
          include: {
            items: {
              include: { foodItem: true },
            },
          },
        },
      },
    });

    if (!plan) throw new NotFoundException('Nutrition plan not found');
    return plan;
  }

  // ============================================
  // MEALS
  // ============================================

  async addMeal(nutritionPlanId: string, data: {
    name: string;
    orderIndex?: number;
    timeSlot?: string;
  }) {
    return this.prisma.meal.create({
      data: {
        ...data,
        nutritionPlanId,
      },
    });
  }

  async addFoodToMeal(mealId: string, data: {
    foodItemId: string;
    quantityGrams: number;
    notes?: string;
  }) {
    return this.prisma.mealPlanItem.create({
      data: {
        ...data,
        mealId,
      },
      include: { foodItem: true },
    });
  }

  // ============================================
  // FOOD DATABASE
  // ============================================

  async searchFoods(query: string, category?: string) {
    return this.prisma.foodItem.findMany({
      where: {
        AND: [
          category ? { category } : {},
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 50,
      orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
    });
  }

  async createFoodItem(data: {
    name: string;
    brand?: string;
    barcode?: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g?: number;
    category?: string;
  }) {
    return this.prisma.foodItem.create({ data });
  }

  async getFoodById(id: string) {
    const food = await this.prisma.foodItem.findUnique({
      where: { id },
    });
    if (!food) throw new NotFoundException('Food item not found');
    return food;
  }

  // ============================================
  // FOOD EQUIVALENCY CALCULATOR
  // ============================================

  async calculateFoodSwap(
    originalFoodId: string,
    originalQuantity: number,
    targetFoodId: string,
    swapByMacro: 'carbs' | 'protein' | 'fat' | 'calories' = 'carbs',
  ) {
    const [originalFood, targetFood] = await Promise.all([
      this.getFoodById(originalFoodId),
      this.getFoodById(targetFoodId),
    ]);

    const macroMap = {
      carbs: { original: originalFood.carbsPer100g, target: targetFood.carbsPer100g },
      protein: { original: originalFood.proteinPer100g, target: targetFood.proteinPer100g },
      fat: { original: originalFood.fatPer100g, target: targetFood.fatPer100g },
      calories: { original: originalFood.caloriesPer100g, target: targetFood.caloriesPer100g },
    };

    const newQuantity = this.calculator.calculateFoodEquivalency(
      originalQuantity,
      macroMap[swapByMacro].original,
      macroMap[swapByMacro].target,
      swapByMacro,
    );

    // Calculate all macros for both portions
    const originalMacros = this.calculateMacrosForPortion(originalFood, originalQuantity);
    const newMacros = this.calculateMacrosForPortion(targetFood, newQuantity);

    return {
      originalFood: {
        ...originalFood,
        quantity: originalQuantity,
        macros: originalMacros,
      },
      targetFood: {
        ...targetFood,
        quantity: newQuantity,
        macros: newMacros,
      },
      swapByMacro,
      summary: `Replace ${originalQuantity}g of ${originalFood.name} with ${newQuantity}g of ${targetFood.name} to match ${swapByMacro}.`,
    };
  }

  private calculateMacrosForPortion(food: any, quantityGrams: number) {
    const factor = quantityGrams / 100;
    return {
      calories: Math.round(food.caloriesPer100g * factor),
      protein: Math.round(food.proteinPer100g * factor * 10) / 10,
      carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
      fat: Math.round(food.fatPer100g * factor * 10) / 10,
    };
  }

  // ============================================
  // NUTRITION LOGGING
  // ============================================

  async logFood(userId: string, data: {
    foodItemId: string;
    mealType: string;
    quantityGrams: number;
  }) {
    const food = await this.getFoodById(data.foodItemId);
    const macros = this.calculateMacrosForPortion(food, data.quantityGrams);

    return this.prisma.nutritionLog.create({
      data: {
        userId,
        foodItemId: data.foodItemId,
        mealType: data.mealType,
        quantityGrams: data.quantityGrams,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      },
      include: { foodItem: true },
    });
  }

  async getDailyNutrition(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await this.prisma.nutritionLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { foodItem: true },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by meal type
    const byMeal = logs.reduce((acc, log) => {
      if (!acc[log.mealType]) acc[log.mealType] = [];
      acc[log.mealType].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    // Calculate totals
    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      date,
      logs,
      byMeal,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      },
    };
  }

  // ============================================
  // AUTOMATED GROCERY LIST
  // ============================================

  async generateGroceryList(userId: string, nutritionPlanId: string, weekStartDate: Date) {
    const plan = await this.getNutritionPlanById(nutritionPlanId);

    // Aggregate all items from meals
    const itemsMap = new Map<string, { name: string; quantity: number; category: string }>();

    for (const meal of plan.meals) {
      for (const item of meal.items) {
        // Multiply by 7 for weekly quantity
        const weeklyQuantity = item.quantityGrams * 7;
        const existing = itemsMap.get(item.foodItem.name);
        
        if (existing) {
          existing.quantity += weeklyQuantity;
        } else {
          itemsMap.set(item.foodItem.name, {
            name: item.foodItem.name,
            quantity: weeklyQuantity,
            category: item.foodItem.category || 'Other',
          });
        }
      }
    }

    // Create or update grocery list
    const groceryList = await this.prisma.groceryList.upsert({
      where: {
        userId_weekStartDate: { userId, weekStartDate },
      },
      create: { userId, weekStartDate },
      update: {},
    });

    // Clear existing items and add new ones
    await this.prisma.groceryItem.deleteMany({
      where: { groceryListId: groceryList.id },
    });

    const items = Array.from(itemsMap.values()).map((item) => ({
      groceryListId: groceryList.id,
      name: item.name,
      quantity: item.quantity,
      unit: 'g',
      category: item.category,
    }));

    await this.prisma.groceryItem.createMany({ data: items });

    return this.prisma.groceryList.findUnique({
      where: { id: groceryList.id },
      include: {
        items: { orderBy: { category: 'asc' } },
      },
    });
  }

  async getGroceryList(userId: string, weekStartDate: Date) {
    return this.prisma.groceryList.findUnique({
      where: {
        userId_weekStartDate: { userId, weekStartDate },
      },
      include: {
        items: { orderBy: { category: 'asc' } },
      },
    });
  }

  async toggleGroceryItem(itemId: string) {
    const item = await this.prisma.groceryItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Grocery item not found');

    return this.prisma.groceryItem.update({
      where: { id: itemId },
      data: { isChecked: !item.isChecked },
    });
  }

  // ============================================
  // PLAN ASSIGNMENTS
  // ============================================

  async assignPlanToUser(userId: string, nutritionPlanId: string) {
    await this.prisma.userNutritionPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    return this.prisma.userNutritionPlan.create({
      data: {
        userId,
        nutritionPlanId,
        isActive: true,
      },
    });
  }

  async getUserActivePlan(userId: string) {
    return this.prisma.userNutritionPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        nutritionPlan: {
          include: {
            meals: {
              include: { items: { include: { foodItem: true } } },
            },
          },
        },
      },
    });
  }
}

