import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertType, AlertSeverity } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SMART COACH ALERT LOGIC
  // ============================================

  /**
   * Run automated alert checks for all athletes of a coach
   * This should be called by a cron job (e.g., daily)
   */
  async runSmartCoachChecks(coachId: string) {
    const athletes = await this.prisma.user.findMany({
      where: { coachId, role: 'ATHLETE' },
      include: {
        workoutLogs: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
        checkIns: {
          orderBy: { submittedAt: 'desc' },
          take: 4, // Last 4 check-ins (8 weeks)
        },
        assignedWorkoutPlans: {
          where: { isActive: true },
        },
      },
    });

    const alerts: any[] = [];

    for (const athlete of athletes) {
      // Check 1: Inactivity Alert
      const inactivityAlert = await this.checkInactivity(athlete);
      if (inactivityAlert) alerts.push(inactivityAlert);

      // Check 2: Weight Stagnation
      const stagnationAlert = await this.checkWeightStagnation(athlete);
      if (stagnationAlert) alerts.push(stagnationAlert);

      // Check 3: Missed Check-in
      const missedCheckIn = await this.checkMissedCheckIn(athlete);
      if (missedCheckIn) alerts.push(missedCheckIn);

      // Check 4: Plan Ending Soon
      const planEndingAlert = await this.checkPlanEnding(athlete);
      if (planEndingAlert) alerts.push(planEndingAlert);
    }

    // Batch create alerts
    if (alerts.length > 0) {
      await this.prisma.alert.createMany({ data: alerts });
    }

    return alerts;
  }

  /**
   * INACTIVITY ALERT
   * Trigger if last workout log is > 3 days old
   */
  private async checkInactivity(athlete: any) {
    const lastLog = athlete.workoutLogs[0];
    
    if (!lastLog) {
      // No logs ever - check if they have an active plan
      if (athlete.assignedWorkoutPlans.length > 0) {
        return this.createAlertData(
          athlete.id,
          'INACTIVITY',
          'CRITICAL',
          'No Activity Recorded',
          `${athlete.firstName} ${athlete.lastName} has an active workout plan but has never logged a workout.`,
        );
      }
      return null;
    }

    const daysSinceLastLog = this.daysBetween(lastLog.completedAt, new Date());

    if (daysSinceLastLog > 3) {
      const severity: AlertSeverity = daysSinceLastLog > 7 ? 'CRITICAL' : 'WARNING';
      return this.createAlertData(
        athlete.id,
        'INACTIVITY',
        severity,
        `Inactive for ${daysSinceLastLog} days`,
        `${athlete.firstName} ${athlete.lastName} hasn't logged a workout in ${daysSinceLastLog} days.`,
        { lastLogDate: lastLog.completedAt, daysSince: daysSinceLastLog },
      );
    }

    return null;
  }

  /**
   * WEIGHT STAGNATION ALERT
   * Trigger if goal is "Loss" and weight change < 0.2kg over 14 days
   */
  private async checkWeightStagnation(athlete: any) {
    if (athlete.goal !== 'WEIGHT_LOSS' || athlete.checkIns.length < 2) {
      return null;
    }

    const recentCheckIns = athlete.checkIns.slice(0, 2);
    const daysBetweenCheckins = this.daysBetween(
      recentCheckIns[1].submittedAt,
      recentCheckIns[0].submittedAt,
    );

    if (daysBetweenCheckins >= 14) {
      const weightChange = recentCheckIns[1].weightKg - recentCheckIns[0].weightKg;
      
      // If weight loss goal but lost less than 0.2kg or gained weight
      if (weightChange > -0.2) {
        return this.createAlertData(
          athlete.id,
          'WEIGHT_STAGNATION',
          'WARNING',
          'Weight Loss Stalled',
          `${athlete.firstName} ${athlete.lastName} has a weight loss goal but only changed ${weightChange.toFixed(1)}kg in the last 14 days.`,
          {
            startWeight: recentCheckIns[1].weightKg,
            endWeight: recentCheckIns[0].weightKg,
            change: weightChange,
          },
        );
      }
    }

    return null;
  }

  /**
   * MISSED CHECK-IN ALERT
   * Trigger if no check-in submitted in the last 14 days
   */
  private async checkMissedCheckIn(athlete: any) {
    const lastCheckIn = athlete.checkIns[0];
    
    if (!lastCheckIn) {
      // Never checked in
      return this.createAlertData(
        athlete.id,
        'MISSED_CHECKIN',
        'WARNING',
        'No Check-ins Recorded',
        `${athlete.firstName} ${athlete.lastName} has never submitted a check-in.`,
      );
    }

    const daysSinceCheckIn = this.daysBetween(lastCheckIn.submittedAt, new Date());

    if (daysSinceCheckIn > 14) {
      return this.createAlertData(
        athlete.id,
        'MISSED_CHECKIN',
        'CRITICAL',
        'Check-in Overdue',
        `${athlete.firstName} ${athlete.lastName}'s check-in is ${daysSinceCheckIn - 14} days overdue.`,
        { lastCheckInDate: lastCheckIn.submittedAt, daysOverdue: daysSinceCheckIn - 14 },
      );
    }

    return null;
  }

  /**
   * PLAN ENDING ALERT
   * Trigger if workout plan ends within 7 days
   */
  private async checkPlanEnding(athlete: any) {
    for (const assignment of athlete.assignedWorkoutPlans) {
      if (assignment.endDate) {
        const daysUntilEnd = this.daysBetween(new Date(), assignment.endDate);
        
        if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
          return this.createAlertData(
            athlete.id,
            'PLAN_ENDING',
            'INFO',
            'Workout Plan Ending Soon',
            `${athlete.firstName} ${athlete.lastName}'s current workout plan ends in ${daysUntilEnd} days.`,
            { planId: assignment.workoutPlanId, endsIn: daysUntilEnd },
          );
        }
      }
    }

    return null;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  async getAlertsForCoach(coachId: string, unreadOnly = false) {
    // Get all athletes for this coach
    const athletes = await this.prisma.user.findMany({
      where: { coachId },
      select: { id: true },
    });

    const athleteIds = athletes.map((a) => a.id);

    return this.prisma.alert.findMany({
      where: {
        userId: { in: athleteIds },
        ...(unreadOnly ? { isRead: false } : {}),
        isDismissed: false,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async markAsRead(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  async dismissAlert(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isDismissed: true },
    });
  }

  async getAlertCounts(coachId: string) {
    const athletes = await this.prisma.user.findMany({
      where: { coachId },
      select: { id: true },
    });

    const athleteIds = athletes.map((a) => a.id);

    const [total, unread, critical] = await Promise.all([
      this.prisma.alert.count({
        where: { userId: { in: athleteIds }, isDismissed: false },
      }),
      this.prisma.alert.count({
        where: { userId: { in: athleteIds }, isRead: false, isDismissed: false },
      }),
      this.prisma.alert.count({
        where: {
          userId: { in: athleteIds },
          severity: 'CRITICAL',
          isDismissed: false,
        },
      }),
    ]);

    return { total, unread, critical };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private createAlertData(
    userId: string,
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    data?: any,
  ) {
    return {
      userId,
      type,
      severity,
      title,
      message,
      data: data || null,
    };
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor(
      (new Date(date2).getTime() - new Date(date1).getTime()) / msPerDay,
    );
  }
}

