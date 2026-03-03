import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  UpdateUserRequest,
  UpdateFitnessLevelRequest,
} from '@fitness/api-client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserRequest) {
    await this.findOne(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
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

  async updateFitnessLevel(
    userId: string,
    updateFitnessLevelDto: UpdateFitnessLevelRequest,
  ) {
    await this.findOne(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { fitnessLevel: updateFitnessLevelDto.fitnessLevel },
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
