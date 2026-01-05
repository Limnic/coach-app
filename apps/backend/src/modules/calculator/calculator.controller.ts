import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  CalculatorService,
  Gender,
  Goal,
  ActivityLevel,
} from './calculator.service';

// ============================================
// DTOs
// ============================================

class CalculateTDEEDto {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

class CalculateMacrosDto extends CalculateTDEEDto {
  goal: Goal;
  customProteinRatio?: number;
  customCarbRatio?: number;
  customFatRatio?: number;
}

class FoodSwapDto {
  originalFood: string;
  originalWeightGrams: number;
  originalMacroPer100g: number;
  targetFood: string;
  targetMacroPer100g: number;
  macroType: 'carbs' | 'protein' | 'fat' | 'calories';
}

class ConvertUnitsDto {
  value: number;
  from: 'kg' | 'lbs' | 'cm' | 'inches';
  to: 'kg' | 'lbs' | 'cm' | 'inches';
}

// ============================================
// CONTROLLER
// ============================================

@ApiTags('calculator')
@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('tdee')
  @ApiOperation({ summary: 'Calculate TDEE using Mifflin-St Jeor formula' })
  @ApiBody({ type: CalculateTDEEDto })
  calculateTDEE(@Body() dto: CalculateTDEEDto) {
    const result = this.calculatorService.calculateTDEE({
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      age: dto.age,
      gender: dto.gender,
      activityLevel: dto.activityLevel,
    });

    return {
      success: true,
      data: {
        ...result,
        explanation: {
          bmr: `Your Basal Metabolic Rate (calories burned at complete rest)`,
          tdee: `Your Total Daily Energy Expenditure (maintenance calories)`,
          activityMultiplier: `Multiplier applied based on ${dto.activityLevel.toLowerCase().replace('_', ' ')} lifestyle`,
        },
      },
    };
  }

  @Post('macros')
  @ApiOperation({ summary: 'Calculate goal-based macronutrient breakdown' })
  @ApiBody({ type: CalculateMacrosDto })
  calculateMacros(@Body() dto: CalculateMacrosDto) {
    const customRatios =
      dto.customProteinRatio || dto.customCarbRatio || dto.customFatRatio
        ? {
            protein: dto.customProteinRatio,
            carbs: dto.customCarbRatio,
            fat: dto.customFatRatio,
          }
        : undefined;

    const result = this.calculatorService.calculateGoalBasedNutrition(
      {
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        age: dto.age,
        gender: dto.gender,
        activityLevel: dto.activityLevel,
      },
      dto.goal,
      customRatios,
    );

    return {
      success: true,
      data: {
        ...result,
        dailyTargets: {
          calories: result.calories,
          protein: `${result.protein}g`,
          carbs: `${result.carbs}g`,
          fat: `${result.fat}g`,
        },
        macroSplit: {
          protein: `${Math.round(result.proteinRatio * 100)}%`,
          carbs: `${Math.round(result.carbRatio * 100)}%`,
          fat: `${Math.round(result.fatRatio * 100)}%`,
        },
        explanation: {
          adjustment:
            dto.goal === 'WEIGHT_LOSS'
              ? '20% calorie deficit for sustainable fat loss'
              : dto.goal === 'WEIGHT_GAIN'
                ? '10% calorie surplus for lean muscle gain'
                : dto.goal === 'BODY_RECOMP'
                  ? '10% deficit for body recomposition'
                  : 'Maintenance calories to maintain current weight',
        },
      },
    };
  }

  @Post('food-swap')
  @ApiOperation({ summary: 'Calculate food equivalency for macro swaps' })
  @ApiBody({ type: FoodSwapDto })
  calculateFoodSwap(@Body() dto: FoodSwapDto) {
    const result = this.calculatorService.calculateFoodSwap(
      dto.originalFood,
      dto.originalWeightGrams,
      dto.originalMacroPer100g,
      dto.targetFood,
      dto.targetMacroPer100g,
      dto.macroType,
    );

    return {
      success: true,
      data: {
        ...result,
        summary: `To match the ${dto.macroType} content of ${dto.originalWeightGrams}g ${dto.originalFood}, you need ${result.newWeightGrams}g of ${dto.targetFood}`,
      },
    };
  }

  @Get('bmi')
  @ApiOperation({ summary: 'Calculate Body Mass Index' })
  calculateBMI(
    @Query('weightKg') weightKg: number,
    @Query('heightCm') heightCm: number,
  ) {
    const result = this.calculatorService.calculateBMI(
      Number(weightKg),
      Number(heightCm),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('ideal-weight')
  @ApiOperation({ summary: 'Calculate ideal weight range using multiple formulas' })
  calculateIdealWeight(
    @Query('heightCm') heightCm: number,
    @Query('gender') gender: Gender,
  ) {
    const result = this.calculatorService.calculateIdealWeight(
      Number(heightCm),
      gender,
    );

    return {
      success: true,
      data: {
        ...result,
        unit: 'kg',
        note: 'These are general estimates. Individual factors like muscle mass and body composition should be considered.',
      },
    };
  }

  @Post('convert-units')
  @ApiOperation({ summary: 'Convert between metric and imperial units' })
  @ApiBody({ type: ConvertUnitsDto })
  convertUnits(@Body() dto: ConvertUnitsDto) {
    let result: number;

    if (dto.from === 'kg' && dto.to === 'lbs') {
      result = this.calculatorService.convertUnits.kgToLbs(dto.value);
    } else if (dto.from === 'lbs' && dto.to === 'kg') {
      result = this.calculatorService.convertUnits.lbsToKg(dto.value);
    } else if (dto.from === 'cm' && dto.to === 'inches') {
      result = this.calculatorService.convertUnits.cmToInches(dto.value);
    } else if (dto.from === 'inches' && dto.to === 'cm') {
      result = this.calculatorService.convertUnits.inchesToCm(dto.value);
    } else {
      result = dto.value;
    }

    return {
      success: true,
      data: {
        original: { value: dto.value, unit: dto.from },
        converted: { value: result, unit: dto.to },
      },
    };
  }

  @Get('protein-recommendation')
  @ApiOperation({ summary: 'Get protein recommendation based on body weight' })
  getProteinRecommendation(
    @Query('weightKg') weightKg: number,
    @Query('goal') goal?: Goal,
  ) {
    // Different protein targets based on goal
    const gramsPerKg = goal === 'WEIGHT_GAIN' ? 2.2 : goal === 'WEIGHT_LOSS' ? 2.4 : 1.8;

    const protein = this.calculatorService.calculateProteinByWeight(
      Number(weightKg),
      gramsPerKg,
    );

    return {
      success: true,
      data: {
        dailyProteinGrams: protein,
        gramsPerKg,
        perMeal: Math.round(protein / 4), // Assuming 4 meals
        explanation: `Based on ${gramsPerKg}g per kg of body weight`,
      },
    };
  }
}

