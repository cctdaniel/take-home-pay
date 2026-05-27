// Hungary 2026 tax and social contributions model.
// Sources:
// - NAV: Flat 15% personal income tax
// - Social contribution: 18.5% total (pension 10% + health 7% + unemployment 1.5%)
//   Per Act LXXX of 2023

export const HU_INCOME_TAX_RATE = 0.15;

export const HU_SOCIAL_CONTRIBUTIONS_2026 = {
  employeePensionRate: 0.1,
  employeeHealthRate: 0.07,
  employeeUnemploymentRate: 0.015,
} as const;

export const HU_TOTAL_EMPLOYEE_RATE =
  HU_SOCIAL_CONTRIBUTIONS_2026.employeePensionRate +
  HU_SOCIAL_CONTRIBUTIONS_2026.employeeHealthRate +
  HU_SOCIAL_CONTRIBUTIONS_2026.employeeUnemploymentRate;
