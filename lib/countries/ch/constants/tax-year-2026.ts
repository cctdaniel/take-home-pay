// Switzerland 2026 federal tax and social security model.
// Sources:
// - ESTV: Federal direct tax (DBG) progressive rates
// - AHV/IV/EO: 5.3% employee (old age, disability, income compensation)
// - ALV: 1.1% employee (unemployment insurance)
// - Cantonal tax is NOT modeled (varies by canton)
// - Pension fund (BVG) is NOT modeled

export const CH_FEDERAL_TAX_2026 = {
  // Federal tax formula: stepwise rates
  // Single filer rates (DBG Art. 36)
  brackets: [
    { max: 16_100, rate: 0, baseAmount: 0 },
    { max: 33_500, rate: 0.0077, baseAmount: 0 },
    { max: 57_900, rate: 0.0088, baseAmount: 124 },
    { max: 79_400, rate: 0.0264, baseAmount: 286 },
    { max: 108_800, rate: 0.0297, baseAmount: 855 },
    { max: 146_600, rate: 0.0338, baseAmount: 1_728 },
    { max: 186_900, rate: 0.0431, baseAmount: 3_005 },
    { max: 240_200, rate: 0.0545, baseAmount: 4_741 },
    { max: 304_300, rate: 0.0653, baseAmount: 7_645 },
    { max: 405_700, rate: 0.0782, baseAmount: 11_829 },
    { max: 548_400, rate: 0.0887, baseAmount: 19_755 },
    { max: 776_000, rate: 0.0989, baseAmount: 32_426 },
    { max: 912_600, rate: 0.1066, baseAmount: 54_971 },
    { max: Infinity, rate: 0.115, baseAmount: 69_557 },
  ],
} as const;

export const CH_SOCIAL_SECURITY_2026 = {
  ahvIvEoRate: 0.053,
  alvRate: 0.011,
  alvMaxAnnualSalary: 148_200,
} as const;

export const CH_TOTAL_EMPLOYEE_SOCIAL_RATE =
  CH_SOCIAL_SECURITY_2026.ahvIvEoRate + CH_SOCIAL_SECURITY_2026.alvRate;

export function calculateCHFederalTax(taxableIncome: number) {
  const income = Math.max(0, taxableIncome);
  for (let i = CH_FEDERAL_TAX_2026.brackets.length - 1; i >= 0; i--) {
    const bracket = CH_FEDERAL_TAX_2026.brackets[i];
    if (income > (i > 0 ? CH_FEDERAL_TAX_2026.brackets[i - 1].max : 0)) {
      const excess = income - (i > 0 ? CH_FEDERAL_TAX_2026.brackets[i - 1].max : 0);
      return Math.max(0, bracket.baseAmount + excess * bracket.rate);
    }
  }
  return 0;
}
