import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateGoalRequestSchema,
  UpdateGoalRequestSchema,
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../common/types/request';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe<CreateGoalRequest>(CreateGoalRequestSchema)) createGoalDto: CreateGoalRequest,
  ) {
    const userId = req.user.id;
    return this.goalsService.create(userId, createGoalDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.goalsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateGoalRequest>(UpdateGoalRequestSchema)) updateGoalDto: UpdateGoalRequest,
  ) {
    const userId = req.user.id;
    return this.goalsService.update(userId, id, updateGoalDto);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.goalsService.remove(userId, id);
  }
}
