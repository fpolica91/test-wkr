import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGoalRequest, UpdateGoalRequest } from '@fitness/api-client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalRequest) {
    return this.prisma.goal.create({
      data: {
        user: {
          connect: { id: userId },
        },
        goalType: createGoalDto.goalType,
        description: createGoalDto.description,
        targetValue: createGoalDto.targetValue,
        currentValue: createGoalDto.currentValue,
        targetDate: createGoalDto.targetDate ? new Date(createGoalDto.targetDate) : undefined,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    return goal;
  }

  async update(userId: string, id: string, updateGoalDto: UpdateGoalRequest) {
    await this.findOne(userId, id);
    
    // Prepare update data, handling date conversion
    const updateData: any = { ...updateGoalDto };
    if (updateGoalDto.targetDate !== undefined) {
      updateData.targetDate = updateGoalDto.targetDate ? new Date(updateGoalDto.targetDate) : null;
    }
    
    return this.prisma.goal.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
