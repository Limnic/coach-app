import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // WORKOUT PLANS
  // ============================================

  async createWorkoutPlan(coachId: string, data: {
    name: string;
    description?: string;
    difficulty?: number;
    durationWeeks?: number;
    isTemplate?: boolean;
  }) {
    return this.prisma.workoutPlan.create({
      data: {
        ...data,
        coachId,
      },
    });
  }

  async getWorkoutPlans(coachId: string, templatesOnly = false) {
    return this.prisma.workoutPlan.findMany({
      where: {
        coachId,
        ...(templatesOnly ? { isTemplate: true } : {}),
      },
      include: {
        workouts: {
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        },
        _count: { select: { assignedTo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkoutPlanById(id: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        workouts: {
          orderBy: [{ weekNumber: 'asc' }, { orderIndex: 'asc' }],
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              include: {
                exercise: {
                  include: { swapGroup: { include: { exercises: true } } },
                },
              },
            },
          },
        },
        assignedTo: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  // ============================================
  // WORKOUTS
  // ============================================

  async addWorkout(workoutPlanId: string, data: {
    name: string;
    dayOfWeek?: number;
    weekNumber?: number;
    orderIndex?: number;
    notes?: string;
  }) {
    return this.prisma.workout.create({
      data: {
        ...data,
        workoutPlanId,
      },
    });
  }

  async addExerciseToWorkout(workoutId: string, data: {
    exerciseId: string;
    orderIndex?: number;
    sets?: number;
    repsMin?: number;
    repsMax?: number;
    restSeconds?: number;
    rpe?: number;
    tempo?: string;
    notes?: string;
  }) {
    return this.prisma.workoutExercise.create({
      data: {
        ...data,
        workoutId,
      },
      include: { exercise: true },
    });
  }

  // ============================================
  // EXERCISES LIBRARY
  // ============================================

  async getExercises(filters?: {
    targetMuscle?: string;
    equipmentType?: string;
    search?: string;
  }) {
    return this.prisma.exercise.findMany({
      where: {
        ...(filters?.targetMuscle ? { targetMuscle: filters.targetMuscle as any } : {}),
        ...(filters?.equipmentType ? { equipmentType: filters.equipmentType as any } : {}),
        ...(filters?.search ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        swapGroup: {
          include: { exercises: { select: { id: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createExercise(data: {
    name: string;
    description?: string;
    instructions?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    targetMuscle: string;
    secondaryMuscles?: string[];
    equipmentType: string;
    swapGroupId?: string;
    isGlobal?: boolean;
    createdById?: string;
  }) {
    return this.prisma.exercise.create({
      data: {
        ...data,
        targetMuscle: data.targetMuscle as any,
        equipmentType: data.equipmentType as any,
        secondaryMuscles: data.secondaryMuscles as any,
      },
    });
  }

  // ============================================
  // EXERCISE SWAPS
  // ============================================

  async getSwapOptions(exerciseId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        swapGroup: {
          include: {
            exercises: {
              where: { id: { not: exerciseId } },
            },
          },
        },
      },
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return {
      currentExercise: exercise,
      alternatives: exercise.swapGroup?.exercises || [],
    };
  }

  // ============================================
  // ASSIGN PLANS
  // ============================================

  async assignPlanToUser(userId: string, workoutPlanId: string, startDate?: Date) {
    // Deactivate current plans
    await this.prisma.userWorkoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    return this.prisma.userWorkoutPlan.create({
      data: {
        userId,
        workoutPlanId,
        startDate: startDate || new Date(),
        isActive: true,
      },
    });
  }

  async assignPlanToMultipleUsers(userIds: string[], workoutPlanId: string) {
    // Mass customization - assign template to multiple users
    const assignments = userIds.map((userId) => ({
      userId,
      workoutPlanId,
      startDate: new Date(),
      isActive: true,
    }));

    // Deactivate current plans for all users
    await this.prisma.userWorkoutPlan.updateMany({
      where: { userId: { in: userIds }, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    return this.prisma.userWorkoutPlan.createMany({ data: assignments });
  }

  // ============================================
  // WORKOUT LOGS
  // ============================================

  async logWorkoutSet(userId: string, data: {
    exerciseId: string;
    setNumber: number;
    weightKg: number;
    repsPerformed: number;
    rpe?: number;
    notes?: string;
  }) {
    return this.prisma.workoutLog.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getLastSessionData(userId: string, exerciseId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId, exerciseId },
      orderBy: { completedAt: 'desc' },
      take: 10, // Get last 10 sets
    });
  }

  async getWorkoutHistory(userId: string, limit = 30) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  async getExerciseProgression(userId: string, exerciseId: string) {
    const logs = await this.prisma.workoutLog.findMany({
      where: { userId, exerciseId },
      orderBy: { completedAt: 'asc' },
    });

    // Group by session (date)
    const sessions = logs.reduce((acc, log) => {
      const date = log.completedAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    return Object.entries(sessions).map(([date, sets]) => ({
      date,
      maxWeight: Math.max(...sets.map((s) => s.weightKg)),
      totalVolume: sets.reduce((sum, s) => sum + s.weightKg * s.repsPerformed, 0),
      sets: sets.length,
    }));
  }
}

