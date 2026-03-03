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
} from '@nestjs/common';
import { WeightService } from './weight.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateWeightEntryRequestSchema,
  UpdateWeightEntryRequestSchema,
  UpdateWeightUnitRequestSchema,
  type CreateWeightEntryRequest,
  type UpdateWeightEntryRequest,
  type UpdateWeightUnitRequest,
} from '@fitness/api-client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../common/types/request';

@Controller('weight')
@UseGuards(JwtAuthGuard)
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.weightService.findAll(userId);
  }

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe<CreateWeightEntryRequest>(CreateWeightEntryRequestSchema))
    createWeightEntryDto: CreateWeightEntryRequest,
  ) {
    const userId = req.user.id;
    return this.weightService.create(userId, createWeightEntryDto);
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.weightService.getWeightStats(userId);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateWeightEntryRequest>(UpdateWeightEntryRequestSchema))
    updateWeightEntryDto: UpdateWeightEntryRequest,
  ) {
    const userId = req.user.id;
    return this.weightService.update(userId, id, updateWeightEntryDto);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.weightService.remove(userId, id);
  }

  @Patch('preferences/unit')
  updateWeightUnit(
    @Request() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe<UpdateWeightUnitRequest>(UpdateWeightUnitRequestSchema))
    updateWeightUnitDto: UpdateWeightUnitRequest,
  ) {
    const userId = req.user.id;
    return this.weightService.updateWeightUnit(userId, updateWeightUnitDto.userWeightUnit);
  }
}