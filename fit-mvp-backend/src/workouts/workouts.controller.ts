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
  Query,
  UsePipes,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateWorkoutRequestSchema,
  UpdateWorkoutRequestSchema,
  type GenerateWorkoutRequest,
  type UpdateWorkoutRequest,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../common/types/request';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('generate')
  @UsePipes(
    new ZodValidationPipe<GenerateWorkoutRequest>(GenerateWorkoutRequestSchema),
  )
  generateWorkout(
    @Request() req: AuthenticatedRequest,
    @Body() body: GenerateWorkoutRequest,
  ) {
    const userId = req.user.id;
    const locationType = body?.locationType;
    return this.workoutsService.generateWorkout(userId, locationType);
  }

  @Get('next')
  getNextWorkout(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workoutsService.getNextWorkout(userId);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('completed') completed?: string,
  ) {
    const userId = req.user.id;
    const completedBool =
      completed === 'true' ? true : completed === 'false' ? false : undefined;
    return this.workoutsService.findAll(userId, completedBool);
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.workoutsService.getUserStats(userId);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.workoutsService.findOne(userId, id);
  }

  @Patch(':id')
  @UsePipes(
    new ZodValidationPipe<UpdateWorkoutRequest>(UpdateWorkoutRequestSchema),
  )
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutRequest,
  ) {
    const userId = req.user.id;
    return this.workoutsService.update(userId, id, updateWorkoutDto);
  }

  @Patch(':id/complete')
  complete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.workoutsService.completeWorkout(userId, id);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.workoutsService.remove(userId, id);
  }
}
