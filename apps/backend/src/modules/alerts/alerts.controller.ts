import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts for coach athletes' })
  async getAlerts(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.alertsService.getAlertsForCoach(
      req.user.sub,
      unreadOnly === 'true',
    );
  }

  @Get('counts')
  @ApiOperation({ summary: 'Get alert counts' })
  async getAlertCounts(@Request() req) {
    return this.alertsService.getAlertCounts(req.user.sub);
  }

  @Get('run-checks')
  @ApiOperation({ summary: 'Manually run smart coach checks' })
  async runChecks(@Request() req) {
    const alerts = await this.alertsService.runSmartCoachChecks(req.user.sub);
    return {
      success: true,
      alertsGenerated: alerts.length,
      alerts,
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  async markAsRead(@Param('id') id: string) {
    return this.alertsService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss alert' })
  async dismissAlert(@Param('id') id: string) {
    return this.alertsService.dismissAlert(id);
  }
}

