import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { DEFAULT_CATEGORIES } from './default-categories';

/**
 * A new account cannot record an expense until a category exists, so the
 * predefined set is what makes the app usable on day one. These tests pin the
 * two halves of that promise: the set is there the first time it is asked
 * for, and an account that already has categories is left exactly as it is.
 */
describe('CategoriesService — predefined categories', () => {
  let findUnique: jest.Mock;
  let count: jest.Mock;
  let createMany: jest.Mock;
  let findMany: jest.Mock;
  let service: CategoriesService;

  beforeEach(() => {
    findUnique = jest.fn();
    count = jest.fn();
    createMany = jest.fn();
    findMany = jest.fn();

    service = new CategoriesService({
      finance: { findUnique },
      category: { count, createMany, findMany },
    } as never);
  });

  /** A signed-in account, with its category table shaped by `count`. */
  function account(existingCategoryCount: number) {
    findUnique.mockResolvedValue({ id: 'finance-1' });
    count.mockResolvedValue(existingCategoryCount);
    findMany.mockResolvedValue([]);
  }

  it('offers the eleven categories the product defines', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      'Alimentação',
      'Moradia',
      'Transporte',
      'Saúde',
      'Educação',
      'Lazer',
      'Compras',
      'Assinaturas',
      'Contas',
      'Investimentos',
      'Outros',
    ]);
  });

  it('fills a brand-new account before it answers', async () => {
    account(0);

    await service.getCategoriesByUserId('user-1');

    expect(createMany).toHaveBeenCalledWith({
      data: DEFAULT_CATEGORIES.map((name) => ({
        financeId: 'finance-1',
        name,
      })),
      // Enforced by @@unique([financeId, name]), not by this read: two
      // requests arriving together still cannot both insert Alimentação.
      skipDuplicates: true,
    });

    // The answer must already contain them.
    expect(findMany).toHaveBeenCalled();
  });

  it('leaves an account that already has categories alone', async () => {
    account(3);

    await service.getCategoriesByUserId('user-1');

    expect(createMany).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith({
      where: { financeId: 'finance-1' },
      orderBy: { name: 'asc' },
    });
  });

  it('refuses an account with no finance record, as it always did', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.getCategoriesByUserId('user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(createMany).not.toHaveBeenCalled();
  });
});
