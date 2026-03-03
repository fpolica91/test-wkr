import { Module } from '@nestjs/common';
import { WeightService } from './weight.service';
import { WeightController } from './weight.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WeightService],
  controllers: [WeightController],
})
export class WeightModule {}