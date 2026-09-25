import { Controller, UseGuards, Body, Post, Get, Patch, Delete, Request as NestRequest, Param } from "@nestjs/common";
import type { Request } from "express";
import { FinancialGoalsService } from "./financial-goals.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateFinancialGoalDto } from "./dto/create-financial-goal.dto";
import { UpdateFinancialGoalDto } from "./dto/update-financial-goal.dto";
import { UpdateFinancialGoalProgressDto } from "./dto/update-financial-goal-progress.dto";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('financial-goals')
export class FinancialGoalsController {
    constructor (private readonly financialGoalsService: FinancialGoalsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
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
        findAll(@NestRequest() req: AuthenticatedRequest) {
        return this.financialGoalsService.findAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
        findOne(@NestRequest() req: AuthenticatedRequest,@Param('id') id: string,) {
        return this.financialGoalsService.findOne(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
        @Patch(':id')update(@NestRequest() req: AuthenticatedRequest,
        @Param('id') id: string,@Body() dto: UpdateFinancialGoalDto,) {
        return this.financialGoalsService.update(
            req.user.id,
            id,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
        @Patch(':id/progress')
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
        remove(
        @NestRequest() req: AuthenticatedRequest,
        @Param('id') id: string,
        ) {
        return this.financialGoalsService.remove(
            req.user.id,
            id
        );
    }

    @UseGuards(JwtAuthGuard)
        @Patch(':id/progress/remove')
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