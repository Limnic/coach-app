import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    
    // Order matters due to foreign key constraints
    const models = [
      'groceryItem',
      'groceryList',
      'message',
      'alert',
      'checkIn',
      'nutritionLog',
      'mealPlanItem',
      'meal',
      'userNutritionPlan',
      'nutritionPlan',
      'foodSwap',
      'foodItem',
      'workoutLog',
      'userWorkoutPlan',
      'workoutExercise',
      'workout',
      'workoutPlan',
      'exercise',
      'swapGroup',
      'template',
      'user',
    ];

    for (const model of models) {
      await this[model].deleteMany();
    }
  }
}

