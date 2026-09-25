import {
  Body,
  Controller,
  Post,
  Request as NestRequest,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import type { Request } from 'express';
import { UpdateCategoryDto } from './dto/update-category.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
@Get()
getCategories(@NestRequest() req: AuthenticatedRequest) {
  return this.categoriesService.getCategoriesByUserId(
    req.user.id,
  );
}

@UseGuards(JwtAuthGuard)
@Patch(':id')
update(
  @NestRequest() req: AuthenticatedRequest,
  @Param('id') categoryId: string,
  @Body() dto: UpdateCategoryDto,
) {
  return this.categoriesService.updateCategory(
    req.user.id,
    categoryId,
    dto,
  );
}

@UseGuards(JwtAuthGuard)
@Delete(':id')
remove(
  @NestRequest() req: AuthenticatedRequest,
  @Param('id') categoryId: string,
) {
  return this.categoriesService.deleteCategory(
    req.user.id,
    categoryId,
  );
}
}