import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('nutrition')
@Controller('nutrition')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NutritionController {
  constructor(private nutritionService: NutritionService) {}

  // ============================================
  // NUTRITION PLANS
  // ============================================

  @Post('plans')
  @ApiOperation({ summary: 'Create nutrition plan' })
  async createPlan(@Request() req, @Body() data: any) {
    return this.nutritionService.createNutritionPlan(req.user.sub, data);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get nutrition plans' })
  async getPlans(@Request() req, @Query('templates') templates?: string) {
    return this.nutritionService.getNutritionPlans(
      req.user.sub,
      templates === 'true',
    );
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get nutrition plan by ID' })
  async getPlan(@Param('id') id: string) {
    return this.nutritionService.getNutritionPlanById(id);
  }

  @Post('plans/:id/meals')
  @ApiOperation({ summary: 'Add meal to plan' })
  async addMeal(@Param('id') id: string, @Body() data: any) {
    return this.nutritionService.addMeal(id, data);
  }

  @Post('meals/:id/foods')
  @ApiOperation({ summary: 'Add food to meal' })
  async addFoodToMeal(@Param('id') id: string, @Body() data: any) {
    return this.nutritionService.addFoodToMeal(id, data);
  }

  @Post('plans/:planId/assign/:userId')
  @ApiOperation({ summary: 'Assign plan to user' })
  async assignPlan(
    @Param('planId') planId: string,
    @Param('userId') userId: string,
  ) {
    return this.nutritionService.assignPlanToUser(userId, planId);
  }

  // ============================================
  // FOOD DATABASE
  // ============================================

  @Get('foods')
  @ApiOperation({ summary: 'Search food database' })
  async searchFoods(
    @Query('q') query: string,
    @Query('category') category?: string,
  ) {
    return this.nutritionService.searchFoods(query, category);
  }

  @Post('foods')
  @ApiOperation({ summary: 'Add food to database' })
  async createFood(@Body() data: any) {
    return this.nutritionService.createFoodItem(data);
  }

  @Get('foods/:id')
  @ApiOperation({ summary: 'Get food by ID' })
  async getFood(@Param('id') id: string) {
    return this.nutritionService.getFoodById(id);
  }

  // ============================================
  // FOOD SWAP / EQUIVALENCY CALCULATOR
  // ============================================

  @Post('swap')
  @ApiOperation({ summary: 'Calculate food swap equivalency' })
  async calculateSwap(@Body() data: {
    originalFoodId: string;
    originalQuantity: number;
    targetFoodId: string;
    swapByMacro: 'carbs' | 'protein' | 'fat' | 'calories';
  }) {
    return this.nutritionService.calculateFoodSwap(
      data.originalFoodId,
      data.originalQuantity,
      data.targetFoodId,
      data.swapByMacro,
    );
  }

  // ============================================
  // NUTRITION LOGGING
  // ============================================

  @Post('log')
  @ApiOperation({ summary: 'Log food intake' })
  async logFood(@Request() req, @Body() data: any) {
    return this.nutritionService.logFood(req.user.sub, data);
  }

  @Get('log/daily')
  @ApiOperation({ summary: 'Get daily nutrition log' })
  async getDailyLog(@Request() req, @Query('date') date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    return this.nutritionService.getDailyNutrition(req.user.sub, targetDate);
  }

  @Get('my-plan')
  @ApiOperation({ summary: 'Get current user active nutrition plan' })
  async getMyPlan(@Request() req) {
    return this.nutritionService.getUserActivePlan(req.user.sub);
  }

  // ============================================
  // GROCERY LIST
  // ============================================

  @Post('grocery-list/generate')
  @ApiOperation({ summary: 'Generate grocery list from nutrition plan' })
  async generateGroceryList(
    @Request() req,
    @Body() data: { nutritionPlanId: string; weekStartDate: string },
  ) {
    return this.nutritionService.generateGroceryList(
      req.user.sub,
      data.nutritionPlanId,
      new Date(data.weekStartDate),
    );
  }

  @Get('grocery-list')
  @ApiOperation({ summary: 'Get grocery list' })
  async getGroceryList(
    @Request() req,
    @Query('weekStartDate') weekStartDate: string,
  ) {
    return this.nutritionService.getGroceryList(
      req.user.sub,
      new Date(weekStartDate),
    );
  }

  @Put('grocery-list/items/:id/toggle')
  @ApiOperation({ summary: 'Toggle grocery item checked status' })
  async toggleGroceryItem(@Param('id') id: string) {
    return this.nutritionService.toggleGroceryItem(id);
  }
}

