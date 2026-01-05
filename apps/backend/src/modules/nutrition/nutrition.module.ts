import { Module } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { CalculatorModule } from '../calculator/calculator.module';

@Module({
  imports: [CalculatorModule],
  providers: [NutritionService],
  controllers: [NutritionController],
  exports: [NutritionService],
})
export class NutritionModule {}

