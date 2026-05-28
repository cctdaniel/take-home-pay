// Estonia 2026 salary tax parameters
// Sources: https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes

export const EE_TAX_YEAR = 2026;

export const EE_SOURCE_URLS = {
  incomeTax:
    "https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes/income-tax",
  basicAllowance:
    "https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes/basic-allowance",
  unemployment:
    "https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes/unemployment-insurance",
  pension:
    "https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes/funded-pension",
} as const;

export const EE_INCOME_TAX_RATE = 0.22;
export const EE_BASIC_ALLOWANCE_MAX = 7_848;
export const EE_BASIC_ALLOWANCE_FULL_BELOW = 12_000;
export const EE_BASIC_ALLOWANCE_ZERO_ABOVE = 25_200;
export const EE_PENSION_EMPLOYEE_RATE = 0.02;
export const EE_UNEMPLOYMENT_EMPLOYEE_RATE = 0.016;

/** Third pillar — deductible up to min(15% of gross, EUR 6,000/year). EMTA 2026. */
export const EE_THIRD_PILLAR_MAX_GROSS_RATE = 0.15;
export const EE_THIRD_PILLAR_ANNUAL_CAP_2026 = 6_000;

export function calculateEstonianBasicAllowance(annualGross: number): number {
  if (annualGross <= EE_BASIC_ALLOWANCE_FULL_BELOW) {
    return EE_BASIC_ALLOWANCE_MAX;
  }
  if (annualGross >= EE_BASIC_ALLOWANCE_ZERO_ABOVE) {
    return 0;
  }
  const phaseRange = EE_BASIC_ALLOWANCE_ZERO_ABOVE - EE_BASIC_ALLOWANCE_FULL_BELOW;
  const remaining = EE_BASIC_ALLOWANCE_ZERO_ABOVE - annualGross;
  return (EE_BASIC_ALLOWANCE_MAX * remaining) / phaseRange;
}
