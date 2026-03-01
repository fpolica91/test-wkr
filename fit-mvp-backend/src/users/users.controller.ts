import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UpdateUserRequestSchema,
  UpdateFitnessLevelRequestSchema,
  type UpdateUserRequest,
  type UpdateFitnessLevelRequest,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../common/types/request';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  @UsePipes(new ZodValidationPipe<UpdateUserRequest>(UpdateUserRequestSchema))
  updateCurrentUser(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserRequest,
  ) {
    const userId = req.user.id;
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('me/fitness-level')
  @UsePipes(
    new ZodValidationPipe<UpdateFitnessLevelRequest>(
      UpdateFitnessLevelRequestSchema,
    ),
  )
  updateFitnessLevel(
    @Request() req: AuthenticatedRequest,
    @Body() updateFitnessLevelDto: UpdateFitnessLevelRequest,
  ) {
    const userId = req.user.id;
    return this.usersService.updateFitnessLevel(userId, updateFitnessLevelDto);
  }
}
