import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";
import type { CHFilingStatus, SwitzerlandCantonCode } from "./constants/tax-year-2026";

export type { CHFilingStatus, SwitzerlandCantonCode };

export interface CHContributionInputs {
  pillar3a: number;
}

export interface CHCalculatorInputs extends BaseCalculatorInputs {
  country: "CH";
  canton: SwitzerlandCantonCode;
  filingStatus: CHFilingStatus;
  contributions: CHContributionInputs;
}

export interface CHTaxBreakdown extends BaseTaxBreakdown {
  type: "CH";
  incomeTax: number;
  federalIncomeTax: number;
  cantonIncomeTax: number;
  ahvIvEo: number;
  alv: number;
}

export interface CHBreakdown {
  type: "CH";
  grossIncome: number;
  taxableIncome: number;
  canton: SwitzerlandCantonCode;
  cantonName: string;
  filingStatus: CHFilingStatus;
  incomeSplittingApplied: boolean;
  federalBracketTaxes: Array<TaxBracket & { tax: number }>;
  federalIncomeTax: number;
  cantonTaxMultiplier: number;
  cantonIncomeTax: number;
  social: {
    ahvIvEo: number;
    alv: number;
    cappedSalary: number;
    aboveCeilingSalary: number;
    ahvIvEoRate: number;
    alvRateBelowCeiling: number;
    alvRateAboveCeiling: number;
    annualSalaryCeiling: number;
  };
  voluntaryContributions: {
    pillar3a: number;
    pillar3aLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: readonly string[];
}

declare module "../types" {
  interface CountryCodeMap {
    CH: true;
  }

  interface CurrencyCodeMap {
    CHF: true;
  }

  interface ContributionInputMap {
    CH: CHContributionInputs;
  }

  interface CalculatorInputMap {
    CH: CHCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CH: CHTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CH: CHBreakdown;
  }
}

export function isCHInputs(inputs: CalculatorInputs): inputs is CHCalculatorInputs {
  return inputs.country === "CH";
}

export function isCHTaxBreakdown(taxes: TaxBreakdown): taxes is CHTaxBreakdown {
  return "type" in taxes && taxes.type === "CH";
}

export function isCHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CHBreakdown {
  return breakdown.type === "CH";
}
