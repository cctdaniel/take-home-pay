// ============================================================================
// NETHERLANDS TAX CREDITS (2026 ESTIMATES)
// ============================================================================

export const GENERAL_TAX_CREDIT = {
  maxCredit: 3362,
  phaseOutStart: 24813,
  phaseOutEnd: 75518,
};

export const LABOR_TAX_CREDIT = {
  maxCredit: 5700,
  maxIncome: 40000,
  phaseOutEnd: 115000,
};

export function calculateGeneralTaxCredit(income: number): number {
  if (income <= GENERAL_TAX_CREDIT.phaseOutStart) {
    return GENERAL_TAX_CREDIT.maxCredit;
  }

  if (income >= GENERAL_TAX_CREDIT.phaseOutEnd) {
    return 0;
  }

  const reductionRate =
    GENERAL_TAX_CREDIT.maxCredit /
    (GENERAL_TAX_CREDIT.phaseOutEnd - GENERAL_TAX_CREDIT.phaseOutStart);

  const reduced = GENERAL_TAX_CREDIT.maxCredit - reductionRate * (income - GENERAL_TAX_CREDIT.phaseOutStart);
  return Math.max(0, reduced);
}

export function calculateLaborTaxCredit(income: number): number {
  if (income <= 0) {
    return 0;
  }

  if (income <= LABOR_TAX_CREDIT.maxIncome) {
    return (income / LABOR_TAX_CREDIT.maxIncome) * LABOR_TAX_CREDIT.maxCredit;
  }

  if (income >= LABOR_TAX_CREDIT.phaseOutEnd) {
    return 0;
  }

  const phaseOutRate =
    LABOR_TAX_CREDIT.maxCredit /
    (LABOR_TAX_CREDIT.phaseOutEnd - LABOR_TAX_CREDIT.maxIncome);

  const reduced = LABOR_TAX_CREDIT.maxCredit - phaseOutRate * (income - LABOR_TAX_CREDIT.maxIncome);
  return Math.max(0, reduced);
}
