import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInStatus } from '@prisma/client';

@Injectable()
export class CheckInsService {
  constructor(private prisma: PrismaService) {}

  private readonly CHECK_IN_INTERVAL_DAYS = 14; // Bi-weekly

  // ============================================
  // CHECK-IN SUBMISSION (Athlete)
  // ============================================

  async submitCheckIn(userId: string, data: {
    weightKg: number;
    bodyFatPercent?: number;
    photoFront?: string;
    photoSide?: string;
    photoBack?: string;
    sleepQuality?: number;
    stressLevel?: number;
    hungerLevel?: number;
    energyLevel?: number;
    athleteNotes?: string;
  }) {
    // Calculate check-in period
    const now = new Date();
    const periodEnd = now;
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - this.CHECK_IN_INTERVAL_DAYS);

    // Check if there's already a check-in for this period
    const existingCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        userId,
        periodStart: { gte: periodStart },
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('Check-in already submitted for this period');
    }

    // Create check-in
    const checkIn = await this.prisma.checkIn.create({
      data: {
        userId,
        ...data,
        periodStart,
        periodEnd,
        status: 'SUBMITTED',
      },
    });

    // Update user's current weight
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentWeightKg: data.weightKg },
    });

    return checkIn;
  }

  // ============================================
  // CHECK-IN VALIDATION (Gating Feature)
  // ============================================

  async canAccessNextBlock(userId: string): Promise<{
    canAccess: boolean;
    reason?: string;
    lastCheckIn?: Date;
    nextCheckInDue?: Date;
  }> {
    const lastCheckIn = await this.prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (!lastCheckIn) {
      return {
        canAccess: false,
        reason: 'No check-in submitted yet. Please complete your first check-in.',
      };
    }

    const daysSinceCheckIn = this.daysBetween(lastCheckIn.submittedAt, new Date());
    const nextCheckInDue = new Date(lastCheckIn.submittedAt);
    nextCheckInDue.setDate(nextCheckInDue.getDate() + this.CHECK_IN_INTERVAL_DAYS);

    if (daysSinceCheckIn > this.CHECK_IN_INTERVAL_DAYS) {
      return {
        canAccess: false,
        reason: `Check-in overdue by ${daysSinceCheckIn - this.CHECK_IN_INTERVAL_DAYS} days. Please submit your check-in.`,
        lastCheckIn: lastCheckIn.submittedAt,
        nextCheckInDue,
      };
    }

    return {
      canAccess: true,
      lastCheckIn: lastCheckIn.submittedAt,
      nextCheckInDue,
    };
  }

  // ============================================
  // COACH KANBAN BOARD
  // ============================================

  async getCheckInsKanban(coachId: string) {
    const athletes = await this.prisma.user.findMany({
      where: { coachId, role: 'ATHLETE' },
      select: { id: true },
    });

    const athleteIds = athletes.map((a) => a.id);

    // Get all pending and submitted check-ins
    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        userId: { in: athleteIds },
        status: { in: ['SUBMITTED', 'FLAGGED'] },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, goal: true },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // Recently reviewed (last 7 days)
    const reviewed = await this.prisma.checkIn.findMany({
      where: {
        userId: { in: athleteIds },
        status: 'REVIEWED',
        reviewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { reviewedAt: 'desc' },
      take: 20,
    });

    // Group by status for Kanban
    return {
      pending: checkIns.filter((c) => c.status === 'SUBMITTED'),
      flagged: checkIns.filter((c) => c.status === 'FLAGGED'),
      reviewed,
      counts: {
        pending: checkIns.filter((c) => c.status === 'SUBMITTED').length,
        flagged: checkIns.filter((c) => c.status === 'FLAGGED').length,
        reviewed: reviewed.length,
      },
    };
  }

  // ============================================
  // COACH REVIEW
  // ============================================

  async reviewCheckIn(checkInId: string, coachData: {
    coachNotes?: string;
    coachFeedback: string;
    flagged?: boolean;
  }) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    return this.prisma.checkIn.update({
      where: { id: checkInId },
      data: {
        coachNotes: coachData.coachNotes,
        coachFeedback: coachData.coachFeedback,
        status: coachData.flagged ? 'FLAGGED' : 'REVIEWED',
        reviewedAt: new Date(),
      },
    });
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAthleteProgress(userId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { submittedAt: 'asc' },
    });

    // Weight trend
    const weightTrend = checkIns.map((c) => ({
      date: c.submittedAt,
      weight: c.weightKg,
      bodyFat: c.bodyFatPercent,
    }));

    // Calculate averages for wellness metrics
    const recentCheckIns = checkIns.slice(-4); // Last 4 check-ins
    const avgWellness = {
      sleep: this.average(recentCheckIns.map((c) => c.sleepQuality).filter(Boolean) as number[]),
      stress: this.average(recentCheckIns.map((c) => c.stressLevel).filter(Boolean) as number[]),
      hunger: this.average(recentCheckIns.map((c) => c.hungerLevel).filter(Boolean) as number[]),
      energy: this.average(recentCheckIns.map((c) => c.energyLevel).filter(Boolean) as number[]),
    };

    // Calculate weight change rate
    let weeklyWeightChange = 0;
    if (checkIns.length >= 2) {
      const first = checkIns[0];
      const last = checkIns[checkIns.length - 1];
      const days = this.daysBetween(first.submittedAt, last.submittedAt);
      const totalChange = last.weightKg - first.weightKg;
      weeklyWeightChange = days > 0 ? (totalChange / days) * 7 : 0;
    }

    return {
      totalCheckIns: checkIns.length,
      weightTrend,
      currentWeight: checkIns[checkIns.length - 1]?.weightKg,
      startWeight: checkIns[0]?.weightKg,
      totalWeightChange: checkIns.length >= 2
        ? checkIns[checkIns.length - 1].weightKg - checkIns[0].weightKg
        : 0,
      weeklyWeightChange: Math.round(weeklyWeightChange * 100) / 100,
      avgWellness,
      photos: checkIns.map((c) => ({
        date: c.submittedAt,
        front: c.photoFront,
        side: c.photoSide,
        back: c.photoBack,
      })).filter((p) => p.front || p.side || p.back),
    };
  }

  async getCheckInHistory(userId: string, limit = 10) {
    return this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    });
  }

  async getCheckInById(id: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            goal: true,
            targetWeightKg: true,
          },
        },
      },
    });

    if (!checkIn) throw new NotFoundException('Check-in not found');
    return checkIn;
  }

  // ============================================
  // HELPERS
  // ============================================

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor(
      (new Date(date2).getTime() - new Date(date1).getTime()) / msPerDay,
    );
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length * 10) / 10;
  }
}

