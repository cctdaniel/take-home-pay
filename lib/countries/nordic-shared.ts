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
  employeeSocialName: string;
  flatTaxRate?: number;
  flatTaxBaseDeduction?: number;
  taxCredit?: number;
  assumptions: string[];
  sourceUrls: string[];
}

export interface NordicTaxComputation {
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  employeeSocialContribution: number;
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

export function calculateNordicTax(grossSalary: number, config: NordicTaxConfig): NordicTaxComputation {
  const socialBase = config.employeeSocialCap === undefined
    ? grossSalary
    : Math.min(grossSalary, config.employeeSocialCap);
  const employeeSocialContribution = roundCurrency(socialBase * config.employeeSocialRate);
  const taxableIncome = Math.max(
    0,
    grossSalary - config.standardDeduction - (config.flatTaxBaseDeduction ?? 0),
  );
  const progressive = calculateProgressiveTax(taxableIncome, config.brackets);
  const flatTax = config.flatTaxRate ? roundCurrency(taxableIncome * config.flatTaxRate) : 0;
  const incomeTaxBeforeCredits = progressive.tax + flatTax;
  const incomeTax = roundCurrency(Math.max(0, incomeTaxBeforeCredits - (config.taxCredit ?? 0)));
  const totalTax = roundCurrency(incomeTax + employeeSocialContribution);

  return {
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax,
    employeeSocialContribution,
    totalTax,
  };
}
