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
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('workouts')
@Controller('workouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  // ============================================
  // WORKOUT PLANS
  // ============================================

  @Post('plans')
  @ApiOperation({ summary: 'Create a new workout plan' })
  async createPlan(@Request() req, @Body() data: any) {
    return this.workoutsService.createWorkoutPlan(req.user.sub, data);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all workout plans' })
  async getPlans(
    @Request() req,
    @Query('templates') templates?: string,
  ) {
    return this.workoutsService.getWorkoutPlans(
      req.user.sub,
      templates === 'true',
    );
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get workout plan by ID' })
  async getPlan(@Param('id') id: string) {
    return this.workoutsService.getWorkoutPlanById(id);
  }

  @Post('plans/:id/workouts')
  @ApiOperation({ summary: 'Add workout to plan' })
  async addWorkout(@Param('id') id: string, @Body() data: any) {
    return this.workoutsService.addWorkout(id, data);
  }

  @Post('workouts/:id/exercises')
  @ApiOperation({ summary: 'Add exercise to workout' })
  async addExercise(@Param('id') id: string, @Body() data: any) {
    return this.workoutsService.addExerciseToWorkout(id, data);
  }

  // ============================================
  // EXERCISES
  // ============================================

  @Get('exercises')
  @ApiOperation({ summary: 'Get exercise library' })
  async getExercises(
    @Query('muscle') muscle?: string,
    @Query('equipment') equipment?: string,
    @Query('search') search?: string,
  ) {
    return this.workoutsService.getExercises({
      targetMuscle: muscle,
      equipmentType: equipment,
      search,
    });
  }

  @Post('exercises')
  @ApiOperation({ summary: 'Create a new exercise' })
  async createExercise(@Request() req, @Body() data: any) {
    return this.workoutsService.createExercise({
      ...data,
      createdById: req.user.sub,
    });
  }

  @Get('exercises/:id/swaps')
  @ApiOperation({ summary: 'Get swap options for exercise' })
  async getSwapOptions(@Param('id') id: string) {
    return this.workoutsService.getSwapOptions(id);
  }

  // ============================================
  // PLAN ASSIGNMENTS
  // ============================================

  @Post('plans/:planId/assign/:userId')
  @ApiOperation({ summary: 'Assign plan to user' })
  async assignPlan(
    @Param('planId') planId: string,
    @Param('userId') userId: string,
  ) {
    return this.workoutsService.assignPlanToUser(userId, planId);
  }

  @Post('plans/:planId/assign-bulk')
  @ApiOperation({ summary: 'Assign plan to multiple users (Mass Customization)' })
  async assignPlanBulk(
    @Param('planId') planId: string,
    @Body() body: { userIds: string[] },
  ) {
    return this.workoutsService.assignPlanToMultipleUsers(body.userIds, planId);
  }

  // ============================================
  // WORKOUT LOGS
  // ============================================

  @Post('log')
  @ApiOperation({ summary: 'Log a workout set' })
  async logSet(@Request() req, @Body() data: any) {
    return this.workoutsService.logWorkoutSet(req.user.sub, data);
  }

  @Get('log/last/:exerciseId')
  @ApiOperation({ summary: 'Get last session data for exercise' })
  async getLastSession(
    @Request() req,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.workoutsService.getLastSessionData(req.user.sub, exerciseId);
  }

  @Get('log/history')
  @ApiOperation({ summary: 'Get workout history' })
  async getHistory(@Request() req, @Query('limit') limit?: string) {
    return this.workoutsService.getWorkoutHistory(
      req.user.sub,
      limit ? parseInt(limit) : 30,
    );
  }

  @Get('log/progression/:exerciseId')
  @ApiOperation({ summary: 'Get exercise progression over time' })
  async getProgression(
    @Request() req,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.workoutsService.getExerciseProgression(req.user.sub, exerciseId);
  }
}

