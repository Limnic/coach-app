import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplateType } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(coachId: string, data: {
    name: string;
    description?: string;
    type: TemplateType;
    content: any;
    tags?: string[];
    isPublic?: boolean;
  }) {
    return this.prisma.template.create({
      data: {
        ...data,
        coachId,
      },
    });
  }

  async getTemplates(coachId: string, filters?: {
    type?: TemplateType;
    includePublic?: boolean;
    search?: string;
    tags?: string[];
  }) {
    return this.prisma.template.findMany({
      where: {
        AND: [
          filters?.includePublic
            ? { OR: [{ coachId }, { isPublic: true }] }
            : { coachId },
          filters?.type ? { type: filters.type } : {},
          filters?.search
            ? {
                OR: [
                  { name: { contains: filters.search, mode: 'insensitive' } },
                  { description: { contains: filters.search, mode: 'insensitive' } },
                ],
              }
            : {},
          filters?.tags?.length
            ? { tags: { hasSome: filters.tags } }
            : {},
        ],
      },
      include: {
        coach: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        coach: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: string, coachId: string, data: {
    name?: string;
    description?: string;
    content?: any;
    tags?: string[];
    isPublic?: boolean;
  }) {
    // Verify ownership
    const template = await this.prisma.template.findFirst({
      where: { id, coachId },
    });

    if (!template) throw new NotFoundException('Template not found or not owned');

    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string, coachId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, coachId },
    });

    if (!template) throw new NotFoundException('Template not found or not owned');

    return this.prisma.template.delete({ where: { id } });
  }

  async useTemplate(id: string) {
    // Increment usage count
    return this.prisma.template.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }

  async duplicateTemplate(id: string, coachId: string, newName?: string) {
    const original = await this.getTemplateById(id);

    return this.prisma.template.create({
      data: {
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        type: original.type,
        content: original.content,
        tags: original.tags,
        coachId,
        isPublic: false,
      },
    });
  }

  // ============================================
  // TEMPLATE LIBRARY AGGREGATIONS
  // ============================================

  async getLibraryStats(coachId: string) {
    const [workout, nutrition, supplement, checkinProtocol] = await Promise.all([
      this.prisma.template.count({ where: { coachId, type: 'WORKOUT' } }),
      this.prisma.template.count({ where: { coachId, type: 'NUTRITION' } }),
      this.prisma.template.count({ where: { coachId, type: 'SUPPLEMENT' } }),
      this.prisma.template.count({ where: { coachId, type: 'CHECKIN_PROTOCOL' } }),
    ]);

    const popularTags = await this.prisma.template.findMany({
      where: { coachId },
      select: { tags: true },
    });

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    for (const t of popularTags) {
      for (const tag of t.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return {
      counts: {
        workout,
        nutrition,
        supplement,
        checkinProtocol,
        total: workout + nutrition + supplement + checkinProtocol,
      },
      popularTags: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
    };
  }

  // ============================================
  // PREDEFINED TEMPLATE STRUCTURES
  // ============================================

  getWorkoutTemplateStructure() {
    return {
      name: '',
      description: '',
      difficulty: 1,
      durationWeeks: 4,
      workouts: [
        {
          name: 'Day 1',
          dayOfWeek: 1,
          exercises: [
            {
              exerciseId: '',
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              restSeconds: 90,
            },
          ],
        },
      ],
    };
  }

  getNutritionTemplateStructure() {
    return {
      name: '',
      description: '',
      dailyCalories: 2000,
      proteinGrams: 150,
      carbGrams: 200,
      fatGrams: 67,
      meals: [
        {
          name: 'Breakfast',
          timeSlot: '08:00',
          foods: [
            { foodId: '', quantityGrams: 100 },
          ],
        },
      ],
    };
  }

  getSupplementTemplateStructure() {
    return {
      name: '',
      description: '',
      supplements: [
        {
          name: 'Creatine Monohydrate',
          dosage: '5g',
          timing: 'Post-workout',
          notes: 'Take daily',
        },
      ],
    };
  }
}

