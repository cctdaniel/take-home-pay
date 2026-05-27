// Saudi Arabia 2026 tax and social insurance model.
// Sources:
// - ZATCA: 0% personal income tax on salary
// - GOSI: Social Insurance 9.75% employee (Saudis), 0% expat, 11.75% employer
// - GOSI max contribution salary: SAR 45,000/month

export const SA_INCOME_TAX_RATE = 0;

export const SA_SOCIAL_INSURANCE_2026 = {
  employeeRate: 0.0975,
  employerRate: 0.1175,
  maxMonthlySalary: 45_000,
  unemploymentInsuranceEmployeeRate: 0.0075,
  unemploymentInsuranceEmployerRate: 0.0075,
} as const;
