import type { TaxBracket } from "./types";

export interface NordicTaxConfig {
  code: "DK" | "FI" | "IS" | "NO" | "SE";
  currency: "DKK" | "EUR" | "ISK" | "NOK" | "SEK";
  taxYear: number;
  defaultSalary: number;
  brackets: TaxBracket[];
  standardDeduction: number;
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialContributionCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax?: boolean;
  bracketTaxBase?: "taxableIncome" | "grossIncome";
  creditEmployeeSocialContribution?: boolean;
  flatTaxRate?: number;
  flatTaxBaseDeduction?: number;
  taxCredit?: number;
  assumptions: string[];
  sourceUrls: string[];
}

export interface NordicTaxComputation {
  taxableIncome: number;
  bracketTaxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  employeeSocialContribution: number;
  employeeSocialTaxCredit: number;
  totalTax: number;
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case "annual": return 1;
    case "monthly": return 12;
    case "biweekly": return 26;
    case "weekly": return 52;
    default: return 12;
  }
}

export function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  let total = 0;
  const details: NordicTaxComputation["bracketTaxes"] = [];

  for (const bracket of brackets) {
    const upper = bracket.max === Infinity ? income : bracket.max;
    const taxableInBracket = Math.max(0, Math.min(income, upper) - bracket.min);
    const tax = roundCurrency(taxableInBracket * bracket.rate);

    if (taxableInBracket > 0 || bracket.min === 0) {
      details.push({ min: bracket.min, max: bracket.max, rate: bracket.rate, tax });
    }

    total += tax;
  }

  return { tax: roundCurrency(total), details };
}

export function calculateNordicTax(
  grossSalary: number,
  config: NordicTaxConfig,
  options: { additionalPreTaxDeduction?: number } = {},
): NordicTaxComputation {
  const socialBase = config.employeeSocialCap === undefined
    ? grossSalary
    : Math.min(grossSalary, config.employeeSocialCap);
  const uncappedEmployeeSocialContribution = roundCurrency(socialBase * config.employeeSocialRate);
  const employeeSocialContribution = roundCurrency(
    config.employeeSocialContributionCap === undefined
      ? uncappedEmployeeSocialContribution
      : Math.min(uncappedEmployeeSocialContribution, config.employeeSocialContributionCap),
  );
  const incomeTaxBase =
    grossSalary -
    (config.deductEmployeeSocialBeforeIncomeTax
      ? employeeSocialContribution
      : 0) -
    (options.additionalPreTaxDeduction ?? 0);
  const taxableIncome = Math.max(
    0,
    incomeTaxBase - config.standardDeduction - (config.flatTaxBaseDeduction ?? 0),
  );
  const bracketTaxableIncome = config.bracketTaxBase === "grossIncome"
    ? Math.max(0, grossSalary)
    : taxableIncome;
  const progressive = calculateProgressiveTax(bracketTaxableIncome, config.brackets);
  const flatTax = config.flatTaxRate ? roundCurrency(taxableIncome * config.flatTaxRate) : 0;
  const incomeTaxBeforeCredits = progressive.tax + flatTax;
  const incomeTaxAfterStandardCredits = Math.max(
    0,
    incomeTaxBeforeCredits - (config.taxCredit ?? 0),
  );
  const employeeSocialTaxCredit = config.creditEmployeeSocialContribution
    ? Math.min(employeeSocialContribution, incomeTaxAfterStandardCredits)
    : 0;
  const incomeTax = roundCurrency(
    Math.max(0, incomeTaxAfterStandardCredits - employeeSocialTaxCredit),
  );
  const totalTax = roundCurrency(incomeTax + employeeSocialContribution);

  return {
    taxableIncome,
    bracketTaxableIncome,
    bracketTaxes: progressive.details,
    incomeTax,
    employeeSocialContribution,
    employeeSocialTaxCredit: roundCurrency(employeeSocialTaxCredit),
    totalTax,
  };
}
