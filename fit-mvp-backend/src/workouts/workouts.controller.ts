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
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateWorkoutRequestSchema,
  UpdateWorkoutRequestSchema,
  ToggleExerciseCompletionRequestSchema,
  type GenerateWorkoutRequest,
  type UpdateWorkoutRequest,
  type ToggleExerciseCompletionRequest,
  type LocationType,
  type FocusArea,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../common/types/request';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('generate')
  generateWorkout(
    @Request() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe<GenerateWorkoutRequest>(GenerateWorkoutRequestSchema)) body: GenerateWorkoutRequest,
  ) {
    const userId = req.user.id;
    const locationType = body?.locationType;
    const focusArea = body?.focusArea;
    return this.workoutsService.generateWorkout(userId, locationType, focusArea);
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
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateWorkoutRequest>(UpdateWorkoutRequestSchema)) updateWorkoutDto: UpdateWorkoutRequest,
  ) {
    const userId = req.user.id;
    return this.workoutsService.update(userId, id, updateWorkoutDto);
  }

  @Patch(':id/complete')
  complete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.workoutsService.completeWorkout(userId, id);
  }

  @Patch(':workoutId/exercises/:exerciseId')
  toggleExerciseCompletion(
    @Request() req: AuthenticatedRequest,
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Body(new ZodValidationPipe<ToggleExerciseCompletionRequest>(ToggleExerciseCompletionRequestSchema)) body: ToggleExerciseCompletionRequest,
  ) {
    const userId = req.user.id;
    return this.workoutsService.toggleExerciseCompletion(
      userId,
      workoutId,
      exerciseId,
      body.completed,
    );
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.workoutsService.remove(userId, id);
  }

  @Patch(':workoutId/exercises/:exerciseId/swap')
  swapExercise(
    @Request() req: AuthenticatedRequest,
    @Param('workoutId') workoutId: string,
    @Param('exerciseId') exerciseId: string,
    @Query('locationType') locationType?: string,
    @Query('focusArea') focusArea?: string,
  ) {
    const userId = req.user.id;
    return this.workoutsService.swapExercise(
      userId,
      workoutId,
      exerciseId,
      locationType as LocationType | undefined,
      focusArea as FocusArea | undefined,
    );
  }

  @Patch(':id/regenerate')
  regenerateWorkout(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { feedback: string; locationType?: string; focusArea?: string },
  ) {
    const userId = req.user.id;
    return this.workoutsService.regenerateWorkout(
      userId,
      id,
      body.feedback,
      body.locationType as LocationType | undefined,
      body.focusArea as FocusArea | undefined,
    );
  }

  @Patch(':id/vote')
  voteWorkout(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { vote: 'UPVOTE' | 'DOWNVOTE' },
  ) {
    const userId = req.user.id;
    return this.workoutsService.voteWorkout(userId, id, body.vote);
  }
}
