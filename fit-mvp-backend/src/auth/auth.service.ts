import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterRequest, LoginRequest, WeightUnit } from '@fitness/api-client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private convertWeightToKg(weight: number, unit: WeightUnit): number {
    if (unit === 'LB') {
      return weight * 0.45359237;
    }
    return weight;
  }

  async register(registerDto: RegisterRequest) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        passwordHash: hashedPassword,
        email: registerDto.email,
        fitnessLevel: registerDto.fitnessLevel,
        userWeightUnit: registerDto.userWeightUnit || 'KG',
      },
    });

    // Create initial weight entry if provided
    if (registerDto.initialWeight !== undefined) {
      await this.prisma.weightEntry.create({
        data: {
          userId: user.id,
          weight: registerDto.initialWeight,
          bodyFat: registerDto.initialBodyFat,
          date: new Date(),
        },
      });
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        userWeightUnit: user.userWeightUnit || 'KG',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async login(loginDto: LoginRequest) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        userWeightUnit: user.userWeightUnit || 'KG',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async validateUser(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
