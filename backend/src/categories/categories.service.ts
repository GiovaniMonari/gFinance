import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(
    userId: string,
    dto: CreateCategoryDto,
  ) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        userId,
      },
    });

    if (!finance) {
      throw new NotFoundException(
        'Conta não encontrada para o usuário',
      );
    }

    const existingCategory =
      await this.prisma.category.findUnique({
        where: {
          financeId_name: {
            financeId: finance.id,
            name: dto.name,
          },
        },
      });

    if (existingCategory) {
      throw new ConflictException(
        'Essa categoria já existe',
      );
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        finance: {
          connect: {
            id: finance.id,
          },
        },
      },
    });
  }

  async getCategoriesByUserId(userId: string) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Conta não encontrada para o usuário',
    );
  }

  return this.prisma.category.findMany({
    where: {
      financeId: finance.id,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

async updateCategory(
  userId: string,
  categoryId: string,
  dto: UpdateCategoryDto,
) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Conta não encontrada para o usuário',
    );
  }

  const category = await this.prisma.category.findFirst({
    where: {
      id: categoryId,
      financeId: finance.id,
    },
  });

  if (!category) {
    throw new NotFoundException(
      'Categoria não encontrada',
    );
  }

  const existingCategory =
    await this.prisma.category.findFirst({
      where: {
        financeId: finance.id,
        name: dto.name,
        NOT: {
          id: categoryId,
        },
      },
    });

  if (existingCategory) {
    throw new ConflictException(
      'Essa categoria já existe',
    );
  }

  return this.prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name: dto.name,
    },
  });
}

async deleteCategory(
  userId: string,
  categoryId: string,
) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Conta não encontrada para o usuário',
    );
  }

  const category = await this.prisma.category.findFirst({
    where: {
      id: categoryId,
      financeId: finance.id,
    },
  });

  if (!category) {
    throw new NotFoundException(
      'Categoria não encontrada',
    );
  }

  return this.prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
}
}
