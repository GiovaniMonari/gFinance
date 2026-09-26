import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request as NestRequest,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { FinancialGoalsService } from './financial-goals.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { UpdateFinancialGoalProgressDto } from './dto/update-financial-goal-progress.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Financial Goals')
@ApiBearerAuth()
@Controller('financial-goals')
export class FinancialGoalsController {
  constructor(
    private readonly financialGoalsService: FinancialGoalsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Criar uma nova meta financeira',
  })
  create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateFinancialGoalDto,
  ) {
    return this.financialGoalsService.createFinancialGoal(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar metas financeiras',
  })
  findAll(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.financialGoalsService.findAll(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar uma meta financeira por ID',
  })
  findOne(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.financialGoalsService.findOne(
      req.user.id,
      id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma meta financeira',
  })
  update(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateFinancialGoalDto,
  ) {
    return this.financialGoalsService.update(
      req.user.id,
      id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/progress')
  @ApiOperation({
    summary: 'Adicionar valor ao progresso de uma meta',
  })
  updateProgress(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateFinancialGoalProgressDto,
  ) {
    return this.financialGoalsService.updateProgress(
      req.user.id,
      id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir uma meta financeira',
  })
  remove(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.financialGoalsService.remove(
      req.user.id,
      id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/progress/remove')
  @ApiOperation({
    summary: 'Remover valor do progresso de uma meta',
  })
  removeProgress(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateFinancialGoalProgressDto,
  ) {
    return this.financialGoalsService.removeProgress(
      req.user.id,
      id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Consultar movimentações de uma meta',
  })
  findTransactions(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.financialGoalsService.findTransactions(
      req.user.id,
      id,
    );
  }
}