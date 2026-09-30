/**
 * The categories every account starts with.
 *
 * Recording an expense requires a category, so before this list existed a new
 * user had to invent a handful of categories by hand before the app would let
 * them write anything down — on a phone, on day one, with no Open Finance
 * data to suggest any. These eleven replace that.
 *
 * One list, one file. The names are ordinary rows in `Category`: no flag, no
 * join, no special-casing elsewhere, which is why they can be renamed,
 * deleted or added to through the existing endpoints like any other category.
 *
 * Terminology follows what the app already calls these things — the same
 * words `translateCategory` answers with when Open Finance data arrives —
 * so a banked transaction and a hand-written one land on the same label.
 */
export const DEFAULT_CATEGORIES: readonly string[] = [
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
];
