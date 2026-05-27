// Bulgaria 2026 tax and social security model.
// Sources:
// - NRA: Flat 10% personal income tax
// - NSSI: Social security contributions for 2026
//   Pension: 8.78% employee
//   Health: 3.2% employee
//   Unemployment: 0.4% employee
// - Max social security base: BGN 4,130/month (2026)

export const BG_INCOME_TAX_RATE = 0.1;

export const BG_SOCIAL_SECURITY_2026 = {
  employeePensionRate: 0.0878,
  employeeHealthRate: 0.032,
  employeeUnemploymentRate: 0.004,
  employerPensionRate: 0.1043,
  employerHealthRate: 0.048,
  employerUnemploymentRate: 0.006,
  maxMonthlyBase: 4_130,
} as const;

export const BG_TOTAL_EMPLOYEE_RATE =
  BG_SOCIAL_SECURITY_2026.employeePensionRate +
  BG_SOCIAL_SECURITY_2026.employeeHealthRate +
  BG_SOCIAL_SECURITY_2026.employeeUnemploymentRate;

export const BG_TOTAL_EMPLOYER_RATE =
  BG_SOCIAL_SECURITY_2026.employerPensionRate +
  BG_SOCIAL_SECURITY_2026.employerHealthRate +
  BG_SOCIAL_SECURITY_2026.employerUnemploymentRate;
