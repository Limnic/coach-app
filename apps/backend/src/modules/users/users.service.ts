import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Goal, ActivityLevel, Gender, UnitSystem } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedWorkoutPlans: {
          where: { isActive: true },
          include: { workoutPlan: true },
        },
        assignedNutritionPlans: {
          where: { isActive: true },
          include: { nutritionPlan: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      gender?: Gender;
      dateOfBirth?: Date;
      heightCm?: number;
      currentWeightKg?: number;
      targetWeightKg?: number;
      goal?: Goal;
      activityLevel?: ActivityLevel;
      unitSystem?: UnitSystem;
      timezone?: string;
      language?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        goal: true,
        activityLevel: true,
        unitSystem: true,
        timezone: true,
        language: true,
      },
    });
  }

  // Coach-specific: Get all athletes assigned to coach
  async getCoachAthletes(coachId: string) {
    return this.prisma.user.findMany({
      where: {
        coachId,
        role: 'ATHLETE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentWeightKg: true,
        targetWeightKg: true,
        goal: true,
        subscriptionStatus: true,
        lastActiveAt: true,
        createdAt: true,
        checkIns: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
        workoutLogs: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  // Assign athlete to coach
  async assignAthleteToCoach(athleteId: string, coachId: string) {
    // Verify coach exists and has coach role
    const coach = await this.prisma.user.findFirst({
      where: { id: coachId, role: 'COACH' },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return this.prisma.user.update({
      where: { id: athleteId },
      data: { coachId },
    });
  }

  // Get athlete statistics for dashboard
  async getAthleteStats(athleteId: string) {
    const [workoutLogs, checkIns, nutritionLogs] = await Promise.all([
      this.prisma.workoutLog.findMany({
        where: { userId: athleteId },
        orderBy: { completedAt: 'desc' },
        take: 30,
      }),
      this.prisma.checkIn.findMany({
        where: { userId: athleteId },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      }),
      this.prisma.nutritionLog.groupBy({
        by: ['loggedAt'],
        where: {
          userId: athleteId,
          loggedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          calories: true,
          protein: true,
          carbs: true,
          fat: true,
        },
      }),
    ]);

    return {
      workoutLogs,
      checkIns,
      nutritionLogs,
      summary: {
        totalWorkouts: workoutLogs.length,
        totalCheckIns: checkIns.length,
        lastWorkout: workoutLogs[0]?.completedAt || null,
        lastCheckIn: checkIns[0]?.submittedAt || null,
        weightTrend: checkIns.map((c) => ({
          date: c.submittedAt,
          weight: c.weightKg,
        })),
      },
    };
  }

  // Search users (for admin/coach)
  async searchUsers(query: string, role?: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          role ? { role: role as any } : {},
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
      take: 20,
    });
  }
}

