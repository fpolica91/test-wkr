import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { AIWorkoutService } from './ai-workout.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkoutsService, AIWorkoutService],
  controllers: [WorkoutsController],
})
export class WorkoutsModule {}
