import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.sub, data);
  }

  @Get('athletes')
  @ApiOperation({ summary: 'Get all athletes for coach' })
  async getAthletes(@Request() req) {
    return this.usersService.getCoachAthletes(req.user.sub);
  }

  @Get('athletes/:id')
  @ApiOperation({ summary: 'Get specific athlete details' })
  async getAthlete(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('athletes/:id/stats')
  @ApiOperation({ summary: 'Get athlete statistics' })
  async getAthleteStats(@Param('id') id: string) {
    return this.usersService.getAthleteStats(id);
  }

  @Post('athletes/:athleteId/assign')
  @ApiOperation({ summary: 'Assign athlete to coach' })
  async assignAthlete(
    @Request() req,
    @Param('athleteId') athleteId: string,
  ) {
    return this.usersService.assignAthleteToCoach(athleteId, req.user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  async searchUsers(
    @Query('q') query: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.searchUsers(query, role);
  }
}

