import { roundCurrency } from "./calculator-utils";

/** Basic-plus-housing salary share for Gulf employee social contributions. */
export function calculateSalaryShareContributionBase(options: {
  grossSalary: number;
  applies: boolean;
  salaryShare: number;
  monthlyCap?: number;
}): { monthly: number; annual: number } {
  if (!options.applies) {
    return { monthly: 0, annual: 0 };
  }
  const uncapped = (options.grossSalary / 12) * options.salaryShare;
  const monthly = roundCurrency(
    options.monthlyCap != null
      ? Math.min(uncapped, options.monthlyCap)
      : uncapped,
  );
  return { monthly, annual: roundCurrency(monthly * 12) };
}
