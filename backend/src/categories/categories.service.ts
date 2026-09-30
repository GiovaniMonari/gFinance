import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DEFAULT_CATEGORIES } from './default-categories';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Give an account the predefined categories — and only a brand-new one.
   *
   * Two conditions, both deliberate:
   *
   * - **Only when there is nothing there.** An account that already has
   *   categories asked for exactly those, and re-adding a fixed list would
   *   quietly restore the ones its owner deleted. "Avoid creating duplicates
   *   if the user already has categories" is an instruction to leave those
   *   accounts alone, not merely to repeat no name.
   *
   * - **`skipDuplicates` regardless.** The no-duplicates rule is enforced by
   *   `@@unique([financeId, name])` in the database rather than by a
   *   read-then-write race in this method, so two requests arriving together
   *   cannot both insert `Alimentação`.
   *
   * Runs on the read rather than at account creation, so accounts that
   * already exist reach the same state without a migration or a backfill —
   * and so the guarantee holds wherever the first read happens to come from.
   */
  private async ensureDefaultCategories(financeId: string): Promise<void> {
    const existing = await this.prisma.category.count({
      where: {
        financeId,
      },
    });

    if (existing > 0) return;

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name) => ({
        financeId,
        name,
      })),
      skipDuplicates: true,
    });
  }

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

  await this.ensureDefaultCategories(finance.id);

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
