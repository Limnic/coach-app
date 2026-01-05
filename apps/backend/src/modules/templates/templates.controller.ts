import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TemplateType } from '@prisma/client';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  async createTemplate(@Request() req, @Body() data: any) {
    return this.templatesService.createTemplate(req.user.sub, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get templates' })
  async getTemplates(
    @Request() req,
    @Query('type') type?: TemplateType,
    @Query('includePublic') includePublic?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
  ) {
    return this.templatesService.getTemplates(req.user.sub, {
      type,
      includePublic: includePublic === 'true',
      search,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get template library statistics' })
  async getStats(@Request() req) {
    return this.templatesService.getLibraryStats(req.user.sub);
  }

  @Get('structures/:type')
  @ApiOperation({ summary: 'Get template structure for a type' })
  getStructure(@Param('type') type: string) {
    switch (type) {
      case 'workout':
        return this.templatesService.getWorkoutTemplateStructure();
      case 'nutrition':
        return this.templatesService.getNutritionTemplateStructure();
      case 'supplement':
        return this.templatesService.getSupplementTemplateStructure();
      default:
        return {};
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplateById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.templatesService.updateTemplate(id, req.user.sub, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Request() req, @Param('id') id: string) {
    return this.templatesService.deleteTemplate(id, req.user.sub);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Mark template as used' })
  async useTemplate(@Param('id') id: string) {
    return this.templatesService.useTemplate(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate template' })
  async duplicateTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { newName?: string },
  ) {
    return this.templatesService.duplicateTemplate(id, req.user.sub, data.newName);
  }
}

