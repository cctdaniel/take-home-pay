import type { TaxBracket } from "../../types";

// Decree 45333-H — monthly salary income tax tariff (2026).
// https://www.hacienda.go.cr/
export const CR_MONTHLY_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 918_000, rate: 0 },
  { min: 918_000, max: 1_347_000, rate: 0.10 },
  { min: 1_347_000, max: 2_364_000, rate: 0.15 },
  { min: 2_364_000, max: 4_727_000, rate: 0.20 },
  { min: 4_727_000, max: Infinity, rate: 0.25 },
];

// Employee CCSS: SEM 5.50% + IVM 4.33% + Banco Popular 1.00%.
export const CR_CCSS_EMPLOYEE_RATE = 0.1083;

// Monthly tax credits (Decree 45333-H).
export const CR_CHILD_TAX_CREDIT_MONTHLY_2026 = 1_710;
export const CR_SPOUSE_TAX_CREDIT_MONTHLY_2026 = 2_590;

export const CR_MAX_DEPENDENT_CHILDREN = 10;

export const CR_SOURCE_URLS = {
  hacienda: "https://www.hacienda.go.cr/",
  decree45333: "https://www.hacienda.go.cr/docs/D45333.pdf",
} as const;
