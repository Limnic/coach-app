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
import { CheckInsService } from './check-ins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('check-ins')
@Controller('check-ins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInsController {
  constructor(private checkInsService: CheckInsService) {}

  // ============================================
  // ATHLETE ENDPOINTS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Submit a check-in' })
  async submitCheckIn(@Request() req, @Body() data: any) {
    return this.checkInsService.submitCheckIn(req.user.sub, data);
  }

  @Get('can-access')
  @ApiOperation({ summary: 'Check if user can access next training block' })
  async canAccessNextBlock(@Request() req) {
    return this.checkInsService.canAccessNextBlock(req.user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get check-in history' })
  async getHistory(@Request() req, @Query('limit') limit?: string) {
    return this.checkInsService.getCheckInHistory(
      req.user.sub,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get progress analytics' })
  async getProgress(@Request() req) {
    return this.checkInsService.getAthleteProgress(req.user.sub);
  }

  // ============================================
  // COACH ENDPOINTS
  // ============================================

  @Get('kanban')
  @ApiOperation({ summary: 'Get check-ins Kanban board for coach' })
  async getKanban(@Request() req) {
    return this.checkInsService.getCheckInsKanban(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get check-in by ID' })
  async getCheckIn(@Param('id') id: string) {
    return this.checkInsService.getCheckInById(id);
  }

  @Put(':id/review')
  @ApiOperation({ summary: 'Review a check-in' })
  async reviewCheckIn(@Param('id') id: string, @Body() data: any) {
    return this.checkInsService.reviewCheckIn(id, data);
  }

  @Get('athlete/:athleteId/progress')
  @ApiOperation({ summary: 'Get athlete progress (for coach)' })
  async getAthleteProgress(@Param('athleteId') athleteId: string) {
    return this.checkInsService.getAthleteProgress(athleteId);
  }
}

