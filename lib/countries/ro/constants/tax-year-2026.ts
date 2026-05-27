// Romania 2026 tax and social contributions model.
// Sources:
// - ANAF: Flat 10% income tax
// - CNPP: Social security 25% (CAS)
// - CNAS: Health insurance 10% (CASS)
// - Employees can opt out of pension with higher education
// - Work insurance (CAM): 2.25% employer only

export const RO_INCOME_TAX_RATE = 0.1;

export const RO_SOCIAL_SECURITY_2026 = {
  employeePensionRate: 0.25,
  employerPensionRate: 0.0425,
  employeeHealthRate: 0.1,
  employeeWorkInsuranceRate: 0.0225, // CAM - employer only
} as const;
