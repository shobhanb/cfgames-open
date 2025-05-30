export const GENDERS = ['M', 'F'] as const;
export const AGE_CATEGORIES = ['Open', 'Masters', 'Masters 55+'] as const;
export type Gender = (typeof GENDERS)[number];
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export interface ScoreFilter {
  ordinal?: number;
  gender?: Gender;
  ageCategory?: AgeCategory;
  top3?: boolean;
}
