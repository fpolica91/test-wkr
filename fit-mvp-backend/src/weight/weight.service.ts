import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateWeightEntryRequest,
  UpdateWeightEntryRequest,
  WeightUnit,
} from '@fitness/api-client';

@Injectable()
export class WeightService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWeightEntryDto: CreateWeightEntryRequest) {
    return this.prisma.weightEntry.create({
      data: {
        user: {
          connect: { id: userId },
        },
        weight: createWeightEntryDto.weight,
        bodyFat: createWeightEntryDto.bodyFat,
        date: createWeightEntryDto.date ? new Date(createWeightEntryDto.date) : new Date(),
        notes: createWeightEntryDto.notes,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const weightEntry = await this.prisma.weightEntry.findFirst({
      where: { id, userId },
    });
    if (!weightEntry) {
      throw new NotFoundException(`Weight entry with ID ${id} not found`);
    }
    return weightEntry;
  }

  async update(userId: string, id: string, updateWeightEntryDto: UpdateWeightEntryRequest) {
    await this.findOne(userId, id);

    const updateData: any = { ...updateWeightEntryDto };
    if (updateWeightEntryDto.date !== undefined) {
      updateData.date = updateWeightEntryDto.date ? new Date(updateWeightEntryDto.date) : null;
    }

    return this.prisma.weightEntry.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.weightEntry.delete({
      where: { id },
    });
  }

  async getWeightStats(userId: string) {
    const weightEntries = await this.prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (weightEntries.length === 0) {
      return {
        totalEntries: 0,
      };
    }

    const currentWeight = weightEntries[0].weight;
    const previousWeight = weightEntries.length > 1 ? weightEntries[1].weight : undefined;
    const weightChange = previousWeight ? currentWeight - previousWeight : undefined;

    // Calculate 7-day average
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDayEntries = weightEntries.filter(
      (entry) => new Date(entry.date) >= sevenDaysAgo,
    );
    const sevenDayAverage =
      sevenDayEntries.length > 0
        ? sevenDayEntries.reduce((sum, entry) => sum + entry.weight, 0) / sevenDayEntries.length
        : undefined;

    // Calculate 30-day average
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDayEntries = weightEntries.filter(
      (entry) => new Date(entry.date) >= thirtyDaysAgo,
    );
    const thirtyDayAverage =
      thirtyDayEntries.length > 0
        ? thirtyDayEntries.reduce((sum, entry) => sum + entry.weight, 0) /
          thirtyDayEntries.length
        : undefined;

    return {
      currentWeight,
      previousWeight,
      weightChange,
      sevenDayAverage,
      thirtyDayAverage,
      totalEntries: weightEntries.length,
      latestEntryDate: weightEntries[0].date.toISOString(),
    };
  }

  async updateWeightUnit(userId: string, weightUnit: WeightUnit) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { userWeightUnit: weightUnit },
      select: {
        id: true,
        username: true,
        email: true,
        fitnessLevel: true,
        userWeightUnit: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}