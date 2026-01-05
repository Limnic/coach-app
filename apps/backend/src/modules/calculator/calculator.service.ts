import { Injectable } from '@nestjs/common';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type Gender = 'MALE' | 'FEMALE';

export type Goal = 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'BODY_RECOMP';

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTREMELY_ACTIVE';

export interface UserMetrics {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
}

export interface MacroBreakdown {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
}

export interface GoalAdjustedNutrition extends MacroBreakdown {
  goal: Goal;
  calorieAdjustment: number; // percentage (e.g., -20 for cutting)
  maintenanceCalories: number;
}

export interface FoodEquivalency {
  originalFood: string;
  originalWeightGrams: number;
  originalMacro: number;
  targetFood: string;
  targetMacroPerGram: number;
  newWeightGrams: number;
  macroType: 'carbs' | 'protein' | 'fat' | 'calories';
}

// ============================================
// CALCULATOR SERVICE
// ============================================

@Injectable()
export class CalculatorService {
  /**
   * Activity level multipliers for TDEE calculation
   */
  private readonly activityMultipliers: Record<ActivityLevel, number> = {
    SEDENTARY: 1.2, // Little or no exercise
    LIGHTLY_ACTIVE: 1.375, // Light exercise 1-3 days/week
    MODERATELY_ACTIVE: 1.55, // Moderate exercise 3-5 days/week
    VERY_ACTIVE: 1.725, // Hard exercise 6-7 days/week
    EXTREMELY_ACTIVE: 1.9, // Very hard exercise & physical job
  };

  /**
   * Goal calorie adjustments
   */
  private readonly goalAdjustments: Record<Goal, number> = {
    WEIGHT_LOSS: -0.2, // -20% deficit
    WEIGHT_GAIN: 0.1, // +10% surplus
    MAINTENANCE: 0, // No adjustment
    BODY_RECOMP: -0.1, // -10% slight deficit
  };

  /**
   * Default macro ratios by goal (protein/carbs/fat)
   */
  private readonly macroRatios: Record<Goal, [number, number, number]> = {
    WEIGHT_LOSS: [0.35, 0.35, 0.3], // High protein for muscle preservation
    WEIGHT_GAIN: [0.25, 0.5, 0.25], // Higher carbs for energy/performance
    MAINTENANCE: [0.3, 0.4, 0.3], // Balanced
    BODY_RECOMP: [0.35, 0.35, 0.3], // High protein for body composition
  };

  // ============================================
  // TDEE CALCULATION (Mifflin-St Jeor Formula)
  // ============================================

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
   *
   * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
   * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
   */
  calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'MALE' ? baseBMR + 5 : baseBMR - 161;
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * TDEE = BMR × Activity Multiplier
   */
  calculateTDEE(metrics: UserMetrics): TDEEResult {
    const bmr = this.calculateBMR(
      metrics.weightKg,
      metrics.heightCm,
      metrics.age,
      metrics.gender,
    );

    const activityMultiplier = this.activityMultipliers[metrics.activityLevel];
    const tdee = Math.round(bmr * activityMultiplier);

    return {
      bmr: Math.round(bmr),
      tdee,
      activityMultiplier,
    };
  }

  // ============================================
  // MACRO BREAKDOWN CALCULATION
  // ============================================

  /**
   * Calculate macronutrient breakdown for given calories
   * - Protein: 4 calories per gram
   * - Carbs: 4 calories per gram
   * - Fat: 9 calories per gram
   */
  calculateMacros(
    calories: number,
    proteinRatio: number,
    carbRatio: number,
    fatRatio: number,
  ): MacroBreakdown {
    // Normalize ratios to ensure they sum to 1
    const total = proteinRatio + carbRatio + fatRatio;
    const normalizedProtein = proteinRatio / total;
    const normalizedCarbs = carbRatio / total;
    const normalizedFat = fatRatio / total;

    // Calculate grams
    const proteinCalories = calories * normalizedProtein;
    const carbCalories = calories * normalizedCarbs;
    const fatCalories = calories * normalizedFat;

    return {
      calories: Math.round(calories),
      protein: Math.round(proteinCalories / 4), // 4 cal/g
      carbs: Math.round(carbCalories / 4), // 4 cal/g
      fat: Math.round(fatCalories / 9), // 9 cal/g
      proteinRatio: normalizedProtein,
      carbRatio: normalizedCarbs,
      fatRatio: normalizedFat,
    };
  }

  /**
   * Calculate complete nutrition plan based on user metrics and goal
   */
  calculateGoalBasedNutrition(
    metrics: UserMetrics,
    goal: Goal,
    customRatios?: { protein?: number; carbs?: number; fat?: number },
  ): GoalAdjustedNutrition {
    // Calculate TDEE
    const { tdee } = this.calculateTDEE(metrics);

    // Apply goal adjustment
    const adjustment = this.goalAdjustments[goal];
    const targetCalories = Math.round(tdee * (1 + adjustment));

    // Get macro ratios
    const [defaultProtein, defaultCarbs, defaultFat] = this.macroRatios[goal];
    const proteinRatio = customRatios?.protein ?? defaultProtein;
    const carbRatio = customRatios?.carbs ?? defaultCarbs;
    const fatRatio = customRatios?.fat ?? defaultFat;

    // Calculate macros
    const macros = this.calculateMacros(targetCalories, proteinRatio, carbRatio, fatRatio);

    return {
      ...macros,
      goal,
      calorieAdjustment: adjustment * 100,
      maintenanceCalories: tdee,
    };
  }

  // ============================================
  // FOOD EQUIVALENCY CALCULATOR
  // ============================================

  /**
   * Calculate food swap equivalency
   * 
   * Formula: New Weight = (Original Macro / Target Food Macro per gram)
   * 
   * Example: Swap 100g Rice (28g carbs) for Sweet Potato (20g carbs per 100g)
   * New Weight = (28g / 0.20) = 140g Sweet Potato
   */
  calculateFoodEquivalency(
    originalWeightGrams: number,
    originalMacroPer100g: number,
    targetMacroPer100g: number,
    macroType: 'carbs' | 'protein' | 'fat' | 'calories' = 'carbs',
  ): number {
    // Calculate total macro in original portion
    const totalMacro = (originalWeightGrams / 100) * originalMacroPer100g;

    // Calculate target macro per gram
    const targetMacroPerGram = targetMacroPer100g / 100;

    // Calculate new weight needed
    const newWeightGrams = totalMacro / targetMacroPerGram;

    return Math.round(newWeightGrams);
  }

  /**
   * Full food equivalency with detailed breakdown
   */
  calculateFoodSwap(
    originalFood: string,
    originalWeightGrams: number,
    originalMacroPer100g: number,
    targetFood: string,
    targetMacroPer100g: number,
    macroType: 'carbs' | 'protein' | 'fat' | 'calories' = 'carbs',
  ): FoodEquivalency {
    const totalOriginalMacro = (originalWeightGrams / 100) * originalMacroPer100g;
    const newWeightGrams = this.calculateFoodEquivalency(
      originalWeightGrams,
      originalMacroPer100g,
      targetMacroPer100g,
      macroType,
    );

    return {
      originalFood,
      originalWeightGrams,
      originalMacro: totalOriginalMacro,
      targetFood,
      targetMacroPerGram: targetMacroPer100g / 100,
      newWeightGrams,
      macroType,
    };
  }

  // ============================================
  // WEIGHT-BASED CALCULATIONS
  // ============================================

  /**
   * Calculate protein requirements based on body weight
   * Commonly used: 1.6-2.2g per kg of body weight
   */
  calculateProteinByWeight(
    weightKg: number,
    gramsPerKg: number = 2.0,
  ): number {
    return Math.round(weightKg * gramsPerKg);
  }

  /**
   * Calculate ideal weight ranges using various formulas
   */
  calculateIdealWeight(heightCm: number, gender: Gender): {
    hamwi: number;
    devine: number;
    robinson: number;
    miller: number;
    average: number;
  } {
    const heightInches = heightCm / 2.54;
    const inchesOver5Feet = heightInches - 60;

    let hamwi: number, devine: number, robinson: number, miller: number;

    if (gender === 'MALE') {
      hamwi = 48 + 2.7 * inchesOver5Feet;
      devine = 50 + 2.3 * inchesOver5Feet;
      robinson = 52 + 1.9 * inchesOver5Feet;
      miller = 56.2 + 1.41 * inchesOver5Feet;
    } else {
      hamwi = 45.5 + 2.2 * inchesOver5Feet;
      devine = 45.5 + 2.3 * inchesOver5Feet;
      robinson = 49 + 1.7 * inchesOver5Feet;
      miller = 53.1 + 1.36 * inchesOver5Feet;
    }

    return {
      hamwi: Math.round(hamwi),
      devine: Math.round(devine),
      robinson: Math.round(robinson),
      miller: Math.round(miller),
      average: Math.round((hamwi + devine + robinson + miller) / 4),
    };
  }

  /**
   * Calculate Body Mass Index (BMI)
   */
  calculateBMI(weightKg: number, heightCm: number): {
    bmi: number;
    category: string;
  } {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let category: string;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
    };
  }

  // ============================================
  // UNIT CONVERSIONS
  // ============================================

  /**
   * Convert between metric and imperial units
   */
  convertUnits = {
    lbsToKg: (lbs: number): number => Math.round(lbs * 0.453592 * 10) / 10,
    kgToLbs: (kg: number): number => Math.round(kg * 2.20462 * 10) / 10,
    inchesToCm: (inches: number): number => Math.round(inches * 2.54 * 10) / 10,
    cmToInches: (cm: number): number => Math.round(cm / 2.54 * 10) / 10,
    feetInchesToCm: (feet: number, inches: number): number =>
      Math.round((feet * 12 + inches) * 2.54 * 10) / 10,
    cmToFeetInches: (cm: number): { feet: number; inches: number } => {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return { feet, inches };
    },
  };

  // ============================================
  // PROGRESS CALCULATIONS
  // ============================================

  /**
   * Calculate weekly weight change rate
   */
  calculateWeightChangeRate(
    weights: { date: Date; weightKg: number }[],
  ): {
    weeklyChange: number;
    totalChange: number;
    daysTracked: number;
    trend: 'losing' | 'gaining' | 'maintaining';
  } {
    if (weights.length < 2) {
      return {
        weeklyChange: 0,
        totalChange: 0,
        daysTracked: 0,
        trend: 'maintaining',
      };
    }

    // Sort by date
    const sorted = [...weights].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    const firstWeight = sorted[0].weightKg;
    const lastWeight = sorted[sorted.length - 1].weightKg;
    const totalChange = lastWeight - firstWeight;

    const daysDiff =
      (sorted[sorted.length - 1].date.getTime() - sorted[0].date.getTime()) /
      (1000 * 60 * 60 * 24);
    const weeklyChange = daysDiff > 0 ? (totalChange / daysDiff) * 7 : 0;

    let trend: 'losing' | 'gaining' | 'maintaining';
    if (weeklyChange < -0.1) trend = 'losing';
    else if (weeklyChange > 0.1) trend = 'gaining';
    else trend = 'maintaining';

    return {
      weeklyChange: Math.round(weeklyChange * 100) / 100,
      totalChange: Math.round(totalChange * 100) / 100,
      daysTracked: Math.round(daysDiff),
      trend,
    };
  }

  /**
   * Estimate time to goal weight
   */
  estimateTimeToGoal(
    currentWeight: number,
    targetWeight: number,
    weeklyChangeKg: number = 0.5,
  ): {
    weeksToGoal: number;
    estimatedDate: Date;
    recommendedWeeklyChange: number;
  } {
    const weightToChange = Math.abs(targetWeight - currentWeight);
    const direction = targetWeight < currentWeight ? 'loss' : 'gain';

    // Safe weekly change rates
    const safeWeeklyChange = direction === 'loss' ? -0.5 : 0.25;
    const weeklyChange = weeklyChangeKg || Math.abs(safeWeeklyChange);

    const weeksToGoal = Math.ceil(weightToChange / weeklyChange);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + weeksToGoal * 7);

    return {
      weeksToGoal,
      estimatedDate,
      recommendedWeeklyChange: Math.abs(safeWeeklyChange),
    };
  }
}

