import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface ZAContributionInputs {
  retirementAnnuity: number;
}

export interface ZACalculatorInputs extends BaseCalculatorInputs {
  country: "ZA";
  medicalDependents: number;
  contributions: ZAContributionInputs;
}

export interface ZATaxBreakdown extends BaseTaxBreakdown {
  type: "ZA";
  incomeTax: number;
  uif: number;
}

export interface ZABreakdown {
  type: "ZA";
  grossIncome: number;
  taxableIncome: number;
  payeBeforeCredits: number;
  primaryRebate: number;
  medicalTaxCredit: number;
  medicalDependents: number;
  retirementAnnuity: number;
  retirementAnnuityLimit: number;
  uif: {
    contribution: number;
    rate: number;
    maximumAnnual: number;
  };
  assumptions: string[];
  sourceUrls: readonly string[];
}

declare module "../types" {
  interface CountryCodeMap {
    ZA: true;
  }

  interface CurrencyCodeMap {
    ZAR: true;
  }

  interface ContributionInputMap {
    ZA: ZAContributionInputs;
  }

  interface CalculatorInputMap {
    ZA: ZACalculatorInputs;
  }

  interface TaxBreakdownMap {
    ZA: ZATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    ZA: ZABreakdown;
  }
}

export function isZAInputs(inputs: CalculatorInputs): inputs is ZACalculatorInputs {
  return inputs.country === "ZA";
}

export function isZATaxBreakdown(taxes: TaxBreakdown): taxes is ZATaxBreakdown {
  return "type" in taxes && taxes.type === "ZA";
}

export function isZABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ZABreakdown {
  return breakdown.type === "ZA";
}
